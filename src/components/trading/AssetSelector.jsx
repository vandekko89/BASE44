import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Activity, Zap, BarChart3, Target } from "lucide-react";

// Ativos exclusivos da Deriv para opções binárias
const DERIV_ASSETS = {
  volatility: {
    name: "Índices de Volatilidade",
    description: "Índices sintéticos com volatilidade constante - Disponível 24/7",
    assets: [
      { 
        symbol: "R_100", 
        name: "Volatility 100 Index", 
        volatility: "high", 
        payout: 85, 
        spread: 0.1,
        description: "Volatilidade nominal de 100% ao ano",
        tickSize: 0.01,
        minStake: 0.35,
        maxStake: 2000,
        popular: true
      },
      { 
        symbol: "R_75", 
        name: "Volatility 75 Index", 
        volatility: "high", 
        payout: 83, 
        spread: 0.08,
        description: "Volatilidade nominal de 75% ao ano",
        tickSize: 0.01,
        minStake: 0.35,
        maxStake: 2000,
        popular: true
      },
      { 
        symbol: "R_50", 
        name: "Volatility 50 Index", 
        volatility: "medium", 
        payout: 80, 
        spread: 0.06,
        description: "Volatilidade nominal de 50% ao ano",
        tickSize: 0.01,
        minStake: 0.35,
        maxStake: 2000,
        popular: false
      },
      { 
        symbol: "R_25", 
        name: "Volatility 25 Index", 
        volatility: "medium", 
        payout: 78, 
        spread: 0.04,
        description: "Volatilidade nominal de 25% ao ano",
        tickSize: 0.01,
        minStake: 0.35,
        maxStake: 2000,
        popular: false
      },
      { 
        symbol: "R_10", 
        name: "Volatility 10 Index", 
        volatility: "low", 
        payout: 75, 
        spread: 0.02,
        description: "Volatilidade nominal de 10% ao ano",
        tickSize: 0.001,
        minStake: 0.35,
        maxStake: 2000,
        popular: false
      }
    ]
  },
  crash_boom: {
    name: "Crash e Boom",
    description: "Índices com picos e quedas programados - Alta volatilidade",
    assets: [
      { 
        symbol: "BOOM1000", 
        name: "Boom 1000 Index", 
        volatility: "extreme", 
        payout: 90, 
        spread: 0.2,
        description: "Pico a cada 1000 ticks em média",
        tickSize: 0.01,
        minStake: 0.35,
        maxStake: 1000,
        popular: true
      },
      { 
        symbol: "CRASH1000", 
        name: "Crash 1000 Index", 
        volatility: "extreme", 
        payout: 90, 
        spread: 0.2,
        description: "Queda a cada 1000 ticks em média",
        tickSize: 0.01,
        minStake: 0.35,
        maxStake: 1000,
        popular: true
      },
      { 
        symbol: "BOOM500", 
        name: "Boom 500 Index", 
        volatility: "extreme", 
        payout: 88, 
        spread: 0.15,
        description: "Pico a cada 500 ticks em média",
        tickSize: 0.01,
        minStake: 0.35,
        maxStake: 1000,
        popular: false
      },
      { 
        symbol: "CRASH500", 
        name: "Crash 500 Index", 
        volatility: "extreme", 
        payout: 88, 
        spread: 0.15,
        description: "Queda a cada 500 ticks em média",
        tickSize: 0.01,
        minStake: 0.35,
        maxStake: 1000,
        popular: false
      }
    ]
  },
  step: {
    name: "Step Indices",
    description: "Índices com movimentos em degraus - Padrões únicos",
    assets: [
      { 
        symbol: "STPUSD", 
        name: "Step Index USD", 
        volatility: "low", 
        payout: 82, 
        spread: 0.05,
        description: "Movimentos em steps de 0.1",
        tickSize: 0.1,
        minStake: 0.35,
        maxStake: 2000,
        popular: false
      }
    ]
  },
  forex: {
    name: "Forex Sintético",
    description: "Pares de moedas sintéticos baseados em dados reais",
    assets: [
      { 
        symbol: "WLDEUR", 
        name: "EUR Basket", 
        volatility: "medium", 
        payout: 81, 
        spread: 0.03,
        description: "Cesta sintética baseada no EUR",
        tickSize: 0.00001,
        minStake: 0.35,
        maxStake: 2000,
        popular: false
      },
      { 
        symbol: "WLDGBP", 
        name: "GBP Basket", 
        volatility: "medium", 
        payout: 82, 
        spread: 0.03,
        description: "Cesta sintética baseada no GBP",
        tickSize: 0.00001,
        minStake: 0.35,
        maxStake: 2000,
        popular: false
      },
      { 
        symbol: "WLDUSD", 
        name: "USD Basket", 
        volatility: "medium", 
        payout: 80, 
        spread: 0.03,
        description: "Cesta sintética baseada no USD",
        tickSize: 0.00001,
        minStake: 0.35,
        maxStake: 2000,
        popular: false
      }
    ]
  }
};

export default function AssetSelector({ selectedAsset, onAssetChange }) {
  const [selectedCategory, setSelectedCategory] = useState('volatility');
  
  const getVolatilityColor = (volatility) => {
    switch (volatility) {
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'extreme': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getVolatilityIcon = (volatility) => {
    switch (volatility) {
      case 'low': return <BarChart3 className="w-4 h-4" />;
      case 'medium': return <Activity className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      case 'extreme': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const currentCategory = DERIV_ASSETS[selectedCategory];

  return (
    <Card className="premium-card">
      <CardHeader className="border-b border-slate-600/30">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="flex items-center gap-2">
            <img 
              src="https://deriv.com/favicons/favicon-32x32.png" 
              alt="Deriv" 
              className="w-6 h-6"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          Ativos da Deriv
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Branding Deriv */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
            <p className="text-red-300 text-sm font-medium">🎯 Plataforma Oficial: Deriv.com</p>
            <p className="text-red-200 text-xs">Índices sintéticos disponíveis 24/7</p>
          </div>

          {/* Seletor de Categoria */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Categoria de Ativos</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volatility">Índices de Volatilidade</SelectItem>
                <SelectItem value="crash_boom">Crash & Boom</SelectItem>
                <SelectItem value="step">Step Indices</SelectItem>
                <SelectItem value="forex">Forex Sintético</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400 mt-1">{currentCategory.description}</p>
          </div>

          {/* Lista de Ativos */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              {currentCategory.name}
              <Badge className="bg-slate-600/30 text-slate-300 text-xs">
                {currentCategory.assets.length} ativos
              </Badge>
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {currentCategory.assets.map((asset) => (
                <div
                  key={asset.symbol}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 relative ${
                    selectedAsset?.symbol === asset.symbol
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-700/30'
                  }`}
                  onClick={() => onAssetChange(asset)}
                >
                  {/* Badge Popular */}
                  {asset.popular && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      POPULAR
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white">{asset.symbol}</h4>
                        {selectedAsset?.symbol === asset.symbol && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            ATIVO
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{asset.name}</p>
                      <p className="text-slate-400 text-xs mb-3">{asset.description}</p>
                      
                      {/* Especificações da Deriv */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Min stake:</span>
                          <span className="text-slate-300 ml-1">${asset.minStake}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Max stake:</span>
                          <span className="text-slate-300 ml-1">${asset.maxStake}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Tick size:</span>
                          <span className="text-slate-300 ml-1">{asset.tickSize}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Spread:</span>
                          <span className="text-slate-300 ml-1">{asset.spread}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <Badge className={`${getVolatilityColor(asset.volatility)} text-xs flex items-center gap-1`}>
                        {getVolatilityIcon(asset.volatility)}
                        {asset.volatility}
                      </Badge>
                      <div className="bg-green-500/20 border border-green-500/30 rounded px-2 py-1">
                        <p className="text-green-300 font-bold text-sm">{asset.payout}%</p>
                        <p className="text-green-200 text-xs">payout</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ativo Selecionado */}
          {selectedAsset && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Configuração Ativa
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Símbolo:</p>
                  <p className="text-white font-bold">{selectedAsset.symbol}</p>
                </div>
                <div>
                  <p className="text-slate-400">Payout:</p>
                  <p className="text-green-300 font-bold">{selectedAsset.payout}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Min/Max Stake:</p>
                  <p className="text-white font-medium">${selectedAsset.minStake} - ${selectedAsset.maxStake}</p>
                </div>
                <div>
                  <p className="text-slate-400">Volatilidade:</p>
                  <Badge className={`${getVolatilityColor(selectedAsset.volatility)} text-xs`}>
                    {selectedAsset.volatility}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Aviso sobre API */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-300 text-xs font-medium mb-1">⚠️ Conexão com API da Deriv</p>
            <p className="text-yellow-200 text-xs">
              Para trading real, configure sua API key da Deriv nas configurações.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}