
import React, { useState, useEffect } from "react";
import { useMarketData } from "@/components/providers/MarketDataContext";
import { useSettings } from "@/components/providers/SettingsContext";
import {
  DollarSign, TrendingUp, Target, AlertTriangle, Percent,
  Play, Pause, Settings, Bot, Trophy, Zap, Eye, EyeOff,
  TrendingDown, Activity, Users, Shield, Clock, Landmark
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from "@/components/ui/select";
import derivApiManager from "@/components/api/DerivAPI"; // Import the real manager

import DecisionPanel from "../components/dashboard/DecisionPanel";
import TradeStatusDisplay from "../components/dashboard/TradeStatusDisplay";
import EntryConfigPanel from "../components/trading/EntryConfigPanel";

// Componente para seleção de ativos
const AssetSelector = ({ selectedAsset, onAssetChange }) => {
  const availableAssets = [
    { symbol: "R_100", name: "Volatility 100 Index", volatility: "high", payout: 85, spread: 0.1, description: "Índice de alta volatilidade sintético" },
    { symbol: "EUR/USD", name: "Euro / US Dollar", volatility: "medium", payout: 82, spread: 0.05, description: "Par de moedas principal" },
    { symbol: "GOLD", name: "Gold", volatility: "high", payout: 80, spread: 0.2, description: "Metal precioso" },
    { symbol: "OIL", name: "Crude Oil", volatility: "medium", payout: 78, spread: 0.15, description: "Commodity energética" },
    { symbol: "US_500", name: "US 500 Index", volatility: "high", payout: 83, spread: 0.1, description: "Índice do mercado de ações dos EUA" },
  ];

  return (
    <Card className="premium-card bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500/30">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-indigo-400" />
          Seleção de Ativo
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Escolha o ativo para o robô operar. Os payouts e características podem variar.
        </p>
        <Select value={selectedAsset.symbol} onValueChange={(value) => {
          const newAsset = availableAssets.find(asset => asset.symbol === value);
          if (newAsset) {
            onAssetChange(newAsset);
          }
        }}>
          <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Seleccione um ativo" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectGroup>
              <SelectLabel>Ativos Disponíveis</SelectLabel>
              {availableAssets.map((asset) => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  <div className="flex items-center justify-between w-full">
                    <span>{asset.name} ({asset.symbol})</span>
                    <Badge className={`ml-2 ${asset.payout >= 85 ? 'bg-emerald-600/50 text-emerald-300' : asset.payout >= 80 ? 'bg-yellow-600/50 text-yellow-300' : 'bg-red-600/50 text-red-300'}`}>
                      {asset.payout}% Payout
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="mt-4 text-sm text-slate-400 space-y-1">
            <p><span className="font-medium text-white">Nome:</span> {selectedAsset.name}</p>
            <p><span className="font-medium text-white">Volatilidade:</span> <Badge className={`ml-1 ${selectedAsset.volatility === 'high' ? 'bg-orange-600/50 text-orange-300' : selectedAsset.volatility === 'medium' ? 'bg-blue-600/50 text-blue-300' : 'bg-gray-600/50 text-gray-300'}`}>{selectedAsset.volatility.charAt(0).toUpperCase() + selectedAsset.volatility.slice(1)}</Badge></p>
            <p><span className="font-medium text-white">Spread:</span> {selectedAsset.spread}</p>
            <p><span className="font-medium text-white">Descrição:</span> {selectedAsset.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};


export default function BinaryTerminal() {
  const { indicators, isActive, toggleRobot } = useMarketData();
  const { config, setConfig } = useSettings();

  const [activeContract, setActiveContract] = useState(null);
  const [lastTradeResult, setLastTradeResult] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState({
    symbol: "R_100",
    name: "Volatility 100 Index",
    volatility: "high",
    payout: 85,
    spread: 0.1,
    description: "Índice de alta volatilidade sintético"
  });

  // Configurações de entrada
  const [entryConfig, setEntryConfig] = useState({
    stakeAmount: 10,
    stakeType: 'fixed',
    expiration: '1m', // Corrigido para '1m'
    minConfidence: 75,
    martingale: {
      enabled: false,
      multiplier: 2.2,
      maxLevels: 3
    }
  });

  const handleEntryConfigChange = (field, value) => {
    setEntryConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Efeito para se inscrever nos eventos da API
  useEffect(() => {
    const handleBalanceUpdate = (balanceData) => {
        setConfig(prev => ({
            ...prev,
            broker: { ...prev.broker, balance: balanceData.balance }
        }));
    };
    
    const handleTradeUpdate = (contract) => {
        // Se o contrato não está mais aberto, é um resultado
        if (!contract.is_open) {
            setLastTradeResult(contract);
            setActiveContract(null);
        } else {
            // Se ainda está aberto, defina-o como o contrato ativo
            setActiveContract(contract);
            setLastTradeResult(null); // Limpar resultado anterior quando um novo trade começa
        }
    };

    derivApiManager.on('balance', handleBalanceUpdate);
    derivApiManager.on('trade_update', handleTradeUpdate);

    // Cleanup: remover listeners
    return () => {
      derivApiManager.off('balance', handleBalanceUpdate);
      derivApiManager.off('trade_update', handleTradeUpdate);
    };
  }, [setConfig]);


  // Sistema de entrada baseado em análise de indicadores
  useEffect(() => {
    // Não operar se o bot não estiver ativo, se já houver um trade, ou se não estiver conectado
    if (!isActive || activeContract || config.broker.status !== 'connected') {
      return;
    }
      
    // Analisar indicadores
    const enabledIndicators = indicators.filter(ind => ind.enabled);
    if (enabledIndicators.length > 0) {
      const buySignals = enabledIndicators.filter(ind => ind.signal === 'buy').length;
      const sellSignals = enabledIndicators.filter(ind => ind.signal === 'sell').length;
      const totalConfidence = enabledIndicators.reduce((sum, ind) => sum + ind.confidence, 0);
      const avgConfidence = totalConfidence / enabledIndicators.length;

      // USAR AS CONFIGURAÇÕES DO USUÁRIO PARA DECIDIR
      let decision = null;
      
      // Verificar se a confiança atende ao mínimo configurado pelo usuário
      if (avgConfidence >= entryConfig.minConfidence) {
        if (buySignals > sellSignals) {
          decision = 'CALL'; // Para API Deriv, 'CALL' para compra
        } else if (sellSignals > buySignals) {
          decision = 'PUT'; // Para API Deriv, 'PUT' para venda
        }
      }

      // Executar entrada se houver decisão clara
      if (decision) {
        // CALCULAR STAKE BASEADO NAS CONFIGURAÇÕES DO USUÁRIO
        let actualStake = entryConfig.stakeAmount;
        
        if (entryConfig.stakeType === 'percentage') {
          if (config.broker.balance !== null && config.broker.balance > 0) {
            actualStake = (config.broker.balance * entryConfig.stakeAmount) / 100;
            actualStake = Math.max(actualStake, 0.35); // Deriv's minimum is often 0.35 USD
          } else {
            actualStake = 0.35; // Valor mínimo se o saldo não estiver disponível
          }
        }

        // Garante que o stake seja um número e positivo
        actualStake = parseFloat(actualStake.toFixed(2));
        if (actualStake <= 0) {
            console.warn("Calculated stake is zero or negative. Skipping trade.");
            return;
        }

        // Parsear expiração de '1m' para 1 (minuto)
        const expirationValue = parseInt(entryConfig.expiration.replace('m', ''));
        if (isNaN(expirationValue) || expirationValue <= 0) {
            console.error("Invalid expiration time:", entryConfig.expiration);
            return;
        }
        
        console.log('🚀 Executing REAL trade:', {
          decision: decision,
          symbol: selectedAsset.symbol,
          stake: actualStake,
          expiration: expirationValue,
          confidence: Math.round(avgConfidence),
          minConfidence: entryConfig.minConfidence,
          signals: `${buySignals} CALL, ${sellSignals} PUT`
        });
        
        derivApiManager.buyContract(
          selectedAsset.symbol,
          actualStake,
          expirationValue, // Expiração em minutos
          decision // 'CALL' ou 'PUT'
        ).then(response => {
            console.log("Contract requested:", response);
        }).catch(err => {
            console.error("Trade execution failed:", err);
            // Poderíamos mostrar uma notificação de erro aqui
        });
      } else {
        // Log quando não há entrada
        console.log('❌ Entry rejected:', {
          currentConfidence: Math.round(avgConfidence),
          minConfidence: entryConfig.minConfidence,
          signals: `${buySignals} CALL, ${sellSignals} PUT`,
          reason: avgConfidence < entryConfig.minConfidence ? 'Insufficient Confidence' : 'Inconclusive Signals'
        });
      }
    }
  }, [isActive, indicators, activeContract, config.broker.status, selectedAsset, entryConfig, config.broker.balance, setConfig]);


  const metrics = {
      payout: selectedAsset.payout, // Use payout from selected asset
      accuracy: 72,
      wins: 18,
      losses: 7,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Terminal Binário Deriv</h1>
          <p className="text-slate-400 text-lg">Operando em tempo real na conta <Badge className={config.broker.accountInfo?.is_virtual ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}>{config.broker.accountInfo?.is_virtual ? "Demo" : "Real"}</Badge></p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-400">Operando:</p>
            <p className="text-lg font-bold text-blue-300">{selectedAsset.symbol}</p>
          </div>
          <Button
            onClick={toggleRobot}
            size="lg"
            className={`px-8 py-4 text-lg font-bold transition-all duration-300 ${
              isActive
                ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30"
            }`}
            disabled={config.broker.status !== 'connected'}
          >
            {isActive ? <Pause className="w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3" />}
            {config.broker.status !== 'connected' ? 'Desconectado' : isActive ? 'Pausar Robô' : 'Iniciar Robô'}
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
         <Card className="premium-card bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <Landmark className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-300">
              {config.broker.balance !== null ? `$${config.broker.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/C'}
            </p>
            <p className="text-xs text-slate-400">Saldo da Conta</p>
          </CardContent>
        </Card>
        <Card className="premium-card bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Percent className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-300">{metrics.payout}%</p>
            <p className="text-xs text-slate-400">Payout Atual</p>
          </CardContent>
        </Card>
        <Card className="premium-card bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-300">{metrics.accuracy}%</p>
            <p className="text-xs text-slate-400">Taxa de Acerto</p>
          </CardContent>
        </Card>
        <Card className="premium-card bg-gradient-to-br from-emerald-500/10 to-green-600/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-300">{metrics.wins}</p>
            <p className="text-xs text-slate-400">Vitórias</p>
          </CardContent>
        </Card>
        <Card className="premium-card bg-gradient-to-br from-red-500/10 to-pink-600/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-300">{metrics.losses}</p>
            <p className="text-xs text-slate-400">Derrotas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico, Seletor de Ativo e Painel de Decisão */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Substituir o Gráfico pelo novo Painel de Status */}
          <TradeStatusDisplay
            activeTrade={activeContract}
            lastTradeResult={lastTradeResult}
            onTradeFinish={() => {}} // A API agora gerencia o fim do trade
          />
        </div>
        <div className="space-y-6">
          <AssetSelector
            selectedAsset={selectedAsset}
            onAssetChange={setSelectedAsset}
          />
          <EntryConfigPanel
            config={entryConfig}
            onConfigChange={handleEntryConfigChange}
          />
          <DecisionPanel
            activeStrategy={null} // activeStrategy is not destructured from useMarketData, so set to null or pass relevant prop if it exists in useMarketData. For now it's not part of this change scope.
            indicators={indicators}
          />
        </div>
      </div>
    </div>
  );
}
