
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Play, Pause, TrendingUp, TrendingDown, Clock, Target, AlertTriangle, Settings } from "lucide-react";

// LÓGICA DAS ESTRATÉGIAS - APENAS AS REGRAS DE EXECUÇÃO
const STRATEGY_LOGIC = {
  'Scalping Pro': {
    rules: {
      buy: (ind) => ind.RSI < 30 && ind.MACD > 0 && ind.Volume > 150000,
      sell: (ind) => ind.RSI > 70 && ind.MACD < 0 && ind.Volume > 150000,
    }
  },
  'Trend Follower': {
    rules: {
      buy: (ind) => ind['EMA 20'] > ind['SMA 50'] && ind.ADX > 25,
      sell: (ind) => ind['EMA 20'] < ind['SMA 50'] && ind.ADX > 25,
    }
  },
  'Mean Reversion': {
    rules: {
      buy: (ind) => ind.RSI < 25 && ind['Bollinger Bands'] > 1.2500,
      sell: (ind) => ind.RSI > 75 && ind['Bollinger Bands'] < 1.2600,
    }
  },
  'EdgeAI Engine': {
    rules: {
      buy: (ind) => {
        const conditions = [ind.RSI < 40, ind.MACD > 0, ind.ADX > 20, ind.Volume > 120000];
        return conditions.filter(Boolean).length >= 3;
      },
      sell: (ind) => {
        const conditions = [ind.RSI > 60, ind.MACD < 0, ind.ADX > 20, ind.Volume > 120000];
        return conditions.filter(Boolean).length >= 3;
      }
    }
  }
};

// CONFIGURAÇÕES GERAIS DO ROBÔ
const GENERAL_ROBOT_CONFIG = {
  baseEntrySize: 100,
  maxHoldTime: 120, // 2 minutos
  cooldownTime: 10, // 10 segundos
  martingaleEnabled: true,
  martingaleMultiplier: 2.0,
  maxMartingaleLevels: 3,
};


export default function TradingRobot({
  indicators,
  aiDecision,
  currentTick,
  activeStrategy,
  onTradeExecuted,
  onStatusChange, // New prop for status synchronization
  onCurrentTradeUpdate, // New prop for current trade synchronization
  isRobotActive, // New prop: Robot's active state controlled externally
  onToggleRobot // New prop: Callback to toggle robot's active state
}) {
  // Estados internos do componente
  const [robotStatus, setRobotStatus] = useState('stopped');
  const [currentTrade, setCurrentTrade] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [martingaleLevel, setMartingaleLevel] = useState(0);
  const [lastTradeResult, setLastTradeResult] = useState(null);

  // Notificar mudanças de status para a Dashboard
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(robotStatus);
    }
  }, [robotStatus, onStatusChange]);

  // Notificar mudanças do trade atual para a Dashboard
  useEffect(() => {
    if (onCurrentTradeUpdate) {
      onCurrentTradeUpdate(currentTrade);
    }
  }, [currentTrade, onCurrentTradeUpdate]);

  // Handle robot start/stop based on external `isRobotActive` prop
  useEffect(() => {
    if (isRobotActive) {
      setRobotStatus('waiting_entry');
      setMartingaleLevel(0);
      setLastTradeResult(null);
    } else {
      setRobotStatus('stopped');
      setCurrentTrade(null);
    }
  }, [isRobotActive]);

  // --- Refs para garantir acesso aos dados mais recentes dentro do loop ---
  const robotStateRef = useRef({
    isActive: isRobotActive, // Use prop for active state
    robotStatus,
    currentTrade,
    martingaleLevel,
    lastTradeResult,
    indicators,
    currentTick,
    activeStrategy
  });

  // Manter os refs sempre atualizados com os estados e props mais recentes
  useEffect(() => {
    robotStateRef.current = {
      isActive: isRobotActive, // Use prop for active state
      robotStatus,
      currentTrade,
      martingaleLevel,
      lastTradeResult,
      indicators,
      currentTick,
      activeStrategy
    };
  }, [isRobotActive, robotStatus, currentTrade, martingaleLevel, lastTradeResult, indicators, currentTick, activeStrategy]);

  // --- Funções de Lógica do Robô ---

  const analyzeMarket = () => {
    const { indicators, activeStrategy, currentTick } = robotStateRef.current;

    if (!activeStrategy) {
      setRobotStatus('waiting_entry');
      setLastAnalysis({ signal: 'hold', confidence: 0, reasoning: ['Nenhuma estratégia ativa'], strategy: 'Nenhuma', currentPrice: currentTick?.price || 1.2550 });
      return;
    }

    setRobotStatus('analyzing');

    const strategyLogic = STRATEGY_LOGIC[activeStrategy.name];
    if (!strategyLogic) {
      setLastAnalysis({ signal: 'hold', confidence: 0, reasoning: ['Lógica da estratégia não encontrada'], strategy: activeStrategy.name, currentPrice: currentTick?.price || 1.2550 });
      setRobotStatus('waiting_entry');
      return;
    }

    // Converter indicadores para objeto para facilitar acesso
    const indicatorData = indicators.reduce((acc, ind) => ({ ...acc, [ind.name]: ind.value }), {});
    indicatorData.currentPrice = currentTick?.price || 1.2550;

    // Calcular confiança média de TODOS os indicadores
    const avgConfidence = indicators.length > 0
      ? indicators.reduce((sum, ind) => sum + ind.confidence, 0) / indicators.length
      : 50;

    let decision = 'hold';
    let reasoning = [`Aguardando setup da estratégia ${activeStrategy.name}`];

    try {
      if (strategyLogic.rules.buy(indicatorData)) {
        decision = 'buy';
        reasoning = [`${activeStrategy.name}: Condições de COMPRA atendidas`];
      } else if (strategyLogic.rules.sell(indicatorData)) {
        decision = 'sell';
        reasoning = [`${activeStrategy.name}: Condições de VENDA atendidas`];
      }
    } catch (e) {
      console.error("Erro ao aplicar regras da estratégia:", e);
      decision = 'hold';
      reasoning = ['Erro na análise - aguardando próxima verificação'];
    }

    const analysis = {
      signal: decision,
      confidence: Math.round(avgConfidence),
      reasoning,
      strategy: activeStrategy.name,
      currentPrice: indicatorData.currentPrice
    };

    setLastAnalysis(analysis);

    const { lastTradeResult, martingaleLevel } = robotStateRef.current;
    let finalSignal = analysis.signal;

    if (GENERAL_ROBOT_CONFIG.martingaleEnabled && lastTradeResult === 'loss' && martingaleLevel < GENERAL_ROBOT_CONFIG.maxMartingaleLevels) {
      // Inverter o sinal se o martingale estiver ativo e o último trade foi perda
      if (analysis.signal === 'buy') finalSignal = 'sell';
      else if (analysis.signal === 'sell') finalSignal = 'buy';
      analysis.reasoning.push(`Martingale Nível ${martingaleLevel + 1}: Direção invertida para ${finalSignal.toUpperCase()}`);
    }

    // Usar a confiança mínima da estratégia ativa!
    const minConfidenceThreshold = activeStrategy.min_confidence_threshold || 70; // Default de 70 se não definido
    if (analysis.confidence >= minConfidenceThreshold && finalSignal !== 'hold') {
      executeTradeEntry({ ...analysis, signal: finalSignal });
    } else {
      setRobotStatus('waiting_entry');
    }
  };

  const executeTradeEntry = (analysis) => {
    const { martingaleLevel, currentTick, activeStrategy } = robotStateRef.current;

    setRobotStatus('in_trade');

    // Calcular tamanho da posição baseado no Martingale
    let entrySize = GENERAL_ROBOT_CONFIG.baseEntrySize;
    if (GENERAL_ROBOT_CONFIG.martingaleEnabled && martingaleLevel > 0) {
      entrySize = GENERAL_ROBOT_CONFIG.baseEntrySize * Math.pow(GENERAL_ROBOT_CONFIG.martingaleMultiplier, martingaleLevel);
    }

    // Usar configurações da estratégia ativa para Stop Loss e Take Profit
    const currentPrice = analysis.currentPrice;
    const stopLossPercent = activeStrategy.parameters?.stopLoss || 2.0; // Default 2.0%
    const takeProfitPercent = activeStrategy.parameters?.takeProfit || 4.0; // Default 4.0%

    const newTrade = {
      id: Date.now(),
      symbol: currentTick?.symbol || 'EUR/USD',
      side: analysis.signal,
      entryPrice: currentPrice,
      entryTime: new Date(),
      quantity: entrySize,
      stopLoss: analysis.signal === 'buy'
        ? currentPrice * (1 - stopLossPercent / 100)
        : currentPrice * (1 + stopLossPercent / 100),
      takeProfit: analysis.signal === 'buy'
        ? currentPrice * (1 + takeProfitPercent / 100)
        : currentPrice * (1 - takeProfitPercent / 100),
      confidence: analysis.confidence,
      status: 'open',
      pnl: 0,
      martingaleLevel: martingaleLevel,
      strategy: analysis.strategy,
      isReverse: robotStateRef.current.lastTradeResult === 'loss' && martingaleLevel > 0
    };

    setCurrentTrade(newTrade);

    if (onTradeExecuted) {
      onTradeExecuted(newTrade);
    }
  };

  const monitorActiveTrade = () => {
    const { currentTrade, currentTick } = robotStateRef.current;
    if (!currentTrade || !currentTick) return;

    const currentPrice = currentTick.price;
    const entryPrice = currentTrade.entryPrice;
    const side = currentTrade.side;

    // Calcular P&L atual
    let currentPnL = 0;
    if (side === 'buy') {
      currentPnL = ((currentPrice - entryPrice) / entryPrice) * 100;
    } else {
      currentPnL = ((entryPrice - currentPrice) / entryPrice) * 100;
    }

    // Atualizar trade com P&L atual
    const updatedTrade = { ...currentTrade, pnl: currentPnL, currentPrice: currentPrice };
    setCurrentTrade(updatedTrade);

    // Verificar condições de saída
    let shouldExit = false;
    let exitReason = '';

    // Stop Loss
    if ((side === 'buy' && currentPrice <= currentTrade.stopLoss) ||
      (side === 'sell' && currentPrice >= currentTrade.stopLoss)) {
      shouldExit = true;
      exitReason = 'Stop Loss';
    }

    // Take Profit
    else if ((side === 'buy' && currentPrice >= currentTrade.takeProfit) ||
      (side === 'sell' && currentPrice <= currentTrade.takeProfit)) {
      shouldExit = true;
      exitReason = 'Take Profit';
    }

    // Tempo máximo
    else if ((new Date() - currentTrade.entryTime) / 1000 > GENERAL_ROBOT_CONFIG.maxHoldTime) {
      shouldExit = true;
      exitReason = 'Tempo Limite';
    }

    if (shouldExit) {
      executeTradeExit(exitReason, currentPnL);
    }
  };

  const executeTradeExit = (reason, finalPnL) => {
    setRobotStatus('waiting_result');
    const tradeResult = finalPnL > 0 ? 'win' : 'loss';

    const closedTrade = {
      ...robotStateRef.current.currentTrade,
      exitPrice: robotStateRef.current.currentTick.price,
      exitTime: new Date(),
      exitReason: reason,
      finalPnL: finalPnL,
      status: 'closed'
    };

    setTradeHistory(prev => [closedTrade, ...prev.slice(0, 9)]);
    setLastTradeResult(tradeResult);

    // Atualizar nível de Martingale
    if (tradeResult === 'loss') {
      setMartingaleLevel(prev => Math.min(prev + 1, GENERAL_ROBOT_CONFIG.maxMartingaleLevels));
    } else {
      setMartingaleLevel(0); // Reset Martingale após win
    }

    if (onTradeExecuted) {
      onTradeExecuted(closedTrade);
    }

    setCurrentTrade(null);

    // Período de cooldown antes da próxima análise
    setRobotStatus('cooldown');
    setTimeout(() => {
      // Check if robot is still active after cooldown
      if (robotStateRef.current.isActive) {
        setRobotStatus('waiting_entry');
      }
    }, GENERAL_ROBOT_CONFIG.cooldownTime * 1000);
  };

  // --- O Coração do Robô (Heartbeat) ---
  useEffect(() => {
    if (!isRobotActive) { // Use the external prop to control heartbeat
      setRobotStatus('stopped');
      return;
    }

    const heartbeat = setInterval(() => {
      const status = robotStateRef.current.robotStatus;

      if (status === 'waiting_entry') {
        analyzeMarket();
      } else if (status === 'in_trade') {
        monitorActiveTrade();
      }
    }, 1000); // O robô "pensa" uma vez por segundo

    return () => clearInterval(heartbeat);
  }, [isRobotActive]); // Dependency changed to the external prop

  const getStatusColor = () => {
    switch (robotStatus) {
      case 'analyzing': return 'text-blue-300 bg-blue-500/20 border-blue-500/30';
      case 'in_trade': return 'text-green-300 bg-green-500/20 border-green-500/30';
      case 'waiting_entry': return 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30';
      case 'waiting_result': return 'text-purple-300 bg-purple-500/20 border-purple-500/30';
      case 'cooldown': return 'text-orange-300 bg-orange-500/20 border-orange-500/30';
      default: return 'text-gray-300 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusText = () => {
    switch (robotStatus) {
      case 'analyzing': return 'Analisando';
      case 'in_trade': return 'Em Trade';
      case 'waiting_entry': return 'Aguardando Entrada';
      case 'waiting_result': return 'Processando Resultado';
      case 'cooldown': return 'Cooldown';
      default: return 'Parado';
    }
  };

  return (
    <Card className="premium-card">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-blue-400" />
            EdgeAI Trading Robot
          </div>
          <Badge className={`${getStatusColor()} border flex items-center gap-1`}>
            <div className={`w-2 h-2 rounded-full ${isRobotActive ? 'animate-pulse' : ''} ${ // Use isRobotActive prop
              robotStatus === 'in_trade' ? 'bg-green-400' :
              robotStatus === 'analyzing' ? 'bg-blue-400' :
              robotStatus === 'waiting_entry' ? 'bg-yellow-400' :
              robotStatus === 'cooldown' ? 'bg-orange-400' : 'bg-gray-400'
            }`}></div>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={onToggleRobot} // Use the external toggle function
              className={isRobotActive // Use isRobotActive prop
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
              }
            >
              {isRobotActive ? ( // Use isRobotActive prop
                <><Pause className="w-4 h-4 mr-2" />Parar Robô</>
              ) : (
                <><Play className="w-4 h-4 mr-2" />Iniciar Robô</>
              )}
            </Button>
            <div className="text-right">
              <p className="text-sm text-slate-400">Próximo Trade</p>
              <p className="font-bold text-white">${(GENERAL_ROBOT_CONFIG.baseEntrySize * Math.pow(GENERAL_ROBOT_CONFIG.martingaleMultiplier, martingaleLevel)).toFixed(0)}</p>
            </div>
          </div>

          {/* Configuração da Estratégia Ativa */}
          {activeStrategy && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuração: {activeStrategy.name}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Confiança Mín:</span><span className="text-white font-medium ml-2">{activeStrategy.min_confidence_threshold}%</span></div>
                <div><span className="text-slate-400">Stop Loss:</span><span className="text-red-300 font-medium ml-2">{activeStrategy.parameters?.stopLoss || 'N/A'}%</span></div>
                <div><span className="text-slate-400">Take Profit:</span><span className="text-green-300 font-medium ml-2">{activeStrategy.parameters?.takeProfit || 'N/A'}%</span></div>
              </div>
            </div>
          )}

          {GENERAL_ROBOT_CONFIG.martingaleEnabled && martingaleLevel > 0 && (
            <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 font-medium">
                  Martingale Nível {martingaleLevel}/{GENERAL_ROBOT_CONFIG.maxMartingaleLevels}
                </span>
              </div>
              <p className="text-orange-200 text-sm mt-1">
                Próxima entrada: ${(GENERAL_ROBOT_CONFIG.baseEntrySize * Math.pow(GENERAL_ROBOT_CONFIG.martingaleMultiplier, martingaleLevel)).toFixed(0)}
                {lastTradeResult === 'loss' && ' (Direção Invertida)'}
              </p>
            </div>
          )}

          {currentTrade && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Trade Ativo - {currentTrade.strategy}
                {currentTrade.isReverse && (
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                    Martingale
                  </Badge>
                )}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Par:</span><span className="text-white font-medium ml-2">{currentTrade.symbol}</span></div>
                <div><span className="text-slate-400">Lado:</span><span className={`font-medium ml-2 flex items-center gap-1 ${currentTrade.side === 'buy' ? 'text-green-300' : 'text-red-300'}`}>{currentTrade.side === 'buy' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{currentTrade.side === 'buy' ? 'COMPRA' : 'VENDA'}</span></div>
                <div><span className="text-slate-400">Entrada:</span><span className="text-white font-medium ml-2">{currentTrade.entryPrice.toFixed(5)}</span></div>
                <div><span className="text-slate-400">Atual:</span><span className="text-white font-medium ml-2">{currentTrade.currentPrice?.toFixed(5) || '-'}</span></div>
                <div><span className="text-slate-400">Stop Loss:</span><span className="text-red-300 font-medium ml-2">{currentTrade.stopLoss.toFixed(5)}</span></div>
                <div><span className="text-slate-400">Take Profit:</span><span className="text-green-300 font-medium ml-2">{currentTrade.takeProfit.toFixed(5)}</span></div>
                <div><span className="text-slate-400">P&L:</span><span className={`font-bold ml-2 ${currentTrade.pnl >= 0 ? 'text-green-300' : 'text-red-300'}`}>{currentTrade.pnl >= 0 ? '+' : ''}{currentTrade.pnl.toFixed(2)}%</span></div>
                <div><span className="text-slate-400">Tempo:</span><span className="text-white font-medium ml-2 flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor((new Date() - new Date(currentTrade.entryTime)) / 1000)}s</span></div>
              </div>
            </div>
          )}

          {lastAnalysis && (
            <div className="bg-slate-800/30 rounded-lg p-4">
              <h4 className="font-medium text-slate-300 mb-3">Última Análise</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-400">Estratégia:</span><span className="text-white font-medium ml-2">{lastAnalysis.strategy}</span></div>
                <div><span className="text-slate-400">Sinal:</span><span className={`font-medium ml-2 ${lastAnalysis.signal === 'buy' ? 'text-green-300' : lastAnalysis.signal === 'sell' ? 'text-red-300' : 'text-yellow-300'}`}>{lastAnalysis.signal === 'buy' ? 'COMPRA' : lastAnalysis.signal === 'sell' ? 'VENDA' : 'MANTER'}</span></div>
                <div><span className="text-slate-400">Confiança:</span><span className="text-white font-medium ml-2">{lastAnalysis.confidence}%</span></div>
                <div><span className="text-slate-400">Preço:</span><span className="text-white font-medium ml-2">{lastAnalysis.currentPrice.toFixed(5)}</span></div>
                <div className="pt-2 border-t border-slate-600/30">
                  <span className="text-slate-400 text-xs">Análise:</span>
                  <div className="mt-1 space-y-1">
                    {lastAnalysis.reasoning?.map((reason, index) => (
                      <div key={index} className="text-slate-200 text-xs flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
