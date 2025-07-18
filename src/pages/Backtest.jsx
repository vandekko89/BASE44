
import React, { useState, useEffect } from "react";
import { TestTube, Play, BarChart3, Calendar, TrendingUp, TrendingDown, RefreshCw, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const getRandom = (min, max, decimals = 2) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

// Estratégias otimizadas para índices sintéticos da Deriv
const DERIV_STRATEGIES = {
  volatility_scalping: {
    name: "Volatility Scalping",
    description: "Estratégia otimizada para R_100, R_75 e R_50. Foco em movimentos rápidos.",
    bestAssets: ["R_100", "R_75", "R_50"],
    expiration: "1m",
    confidence: 75,
    winRate: 68
  },
  crash_boom_hunter: {
    name: "Crash & Boom Hunter",
    description: "Detecta padrões de picos e quedas em BOOM/CRASH. Requer paciência.",
    bestAssets: ["BOOM1000", "CRASH1000", "BOOM500", "CRASH500"],
    expiration: "2m",
    confidence: 80,
    winRate: 62
  },
  step_pattern: {
    name: "Step Pattern",
    description: "Aproveita movimentos em steps nos índices Step. Ideal para consolidações.",
    bestAssets: ["STPUSD"],
    expiration: "3m",
    confidence: 70,
    winRate: 71
  },
  multi_volatility: {
    name: "Multi Volatility",
    description: "Funciona em vários índices de volatilidade, buscando tendências.",
    bestAssets: ["R_100", "R_75", "R_50", "R_25", "R_10"],
    expiration: "1m",
    confidence: 72,
    winRate: 65
  }
};

export default function Backtest() {
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState({
    strategy: "volatility_scalping",
    asset: "R_100",
    startDate: "2024-01-01",
    endDate: "2024-01-30",
    initialBalance: 1000,
    stakeAmount: 10,
    stakeType: 'fixed', // fixed ou percentage
    expiration: '1m', // Default, will be updated by strategy or user selection
    minConfidence: 75,
    martingale: {
      enabled: false,
      multiplier: 2.2,
      maxLevels: 3
    }
  });
  const [results, setResults] = useState(null);
  const [equityData, setEquityData] = useState([]);

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleMartingaleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      martingale: { ...prev.martingale, [field]: value }
    }));
  };

  const generateSimulatedData = () => {
    const strategy = DERIV_STRATEGIES[config.strategy];
    const { initialBalance, stakeAmount, stakeType } = config;

    // Calculate actual stake
    const actualStake = stakeType === 'percentage'
      ? (initialBalance * stakeAmount / 100)
      : stakeAmount;

    // Simular número de trades baseado no período
    const days = (new Date(config.endDate).getTime() - new Date(config.startDate).getTime()) / (1000 * 60 * 60 * 24);
    const tradesPerDay = config.expiration === '1m' ? 40 : config.expiration === '2m' ? 30 : config.expiration === '3m' ? 20 : 15;
    const totalTrades = Math.floor(days * tradesPerDay * getRandom(0.8, 1.2));

    // Taxa de acerto baseada na estratégia e ativo
    let baseWinRate = strategy.winRate;

    // Adjust based on selected asset
    if (strategy.bestAssets.includes(config.asset)) {
      baseWinRate += getRandom(3, 8); // Better performance with recommended assets
    } else {
      baseWinRate -= getRandom(2, 6); // Worse performance with non-recommended assets
    }

    // Adjust based on minConfidence
    baseWinRate += (config.minConfidence - 70) * 0.2; // Small impact for every 10% above/below 70

    // Limit between 45% and 85%
    const winRate = Math.max(45, Math.min(85, Math.round(baseWinRate)));

    // Calcular payout baseado no ativo
    const assetPayouts = {
      "R_100": 85, "R_75": 83, "R_50": 80, "R_25": 78, "R_10": 75,
      "BOOM1000": 90, "CRASH1000": 90, "BOOM500": 88, "CRASH500": 88,
      "STPUSD": 82
    };
    const payout = assetPayouts[config.asset] || 80;

    // Simular resultados com ou sem Martingale
    let finalBalance = initialBalance;
    let currentBalance = initialBalance;
    let maxDrawdown = 0;
    let minBalanceReached = initialBalance; // For drawdown calculation
    let wins = 0;
    let losses = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    if (config.martingale.enabled) {
      let lossStreak = 0;
      for (let i = 0; i < totalTrades; i++) {
        const currentStake = actualStake * Math.pow(config.martingale.multiplier, lossStreak);

        if (currentStake > currentBalance) {
          // Cannot afford next trade, stop simulation for realism
          break;
        }

        const isWin = Math.random() * 100 < winRate;

        if (isWin) {
          const profit = currentStake * (payout / 100);
          currentBalance += profit;
          totalProfit += profit;
          wins++;
          lossStreak = 0;
        } else {
          currentBalance -= currentStake;
          totalLoss += currentStake;
          losses++;
          lossStreak++;

          if (lossStreak >= config.martingale.maxLevels) {
            lossStreak = 0; // Reset after hitting max levels
          }
        }

        // Track minimum balance for max drawdown
        if (currentBalance < minBalanceReached) {
          minBalanceReached = currentBalance;
        }
      }
      finalBalance = currentBalance;
    } else {
      // Simulação simples
      wins = Math.round(totalTrades * (winRate / 100));
      losses = totalTrades - wins;
      if (losses < 0) losses = 0; // Ensure losses is not negative

      totalProfit = wins * actualStake * (payout / 100);
      totalLoss = losses * actualStake;
      finalBalance = initialBalance + totalProfit - totalLoss;

      // Simple max drawdown estimation for non-martingale
      // This is a heuristic, not based on equity curve tracking
      maxDrawdown = Math.max(0, (totalLoss / initialBalance) * 100 * 0.5 + 5);
    }

    // Ensure finalBalance doesn't drop too low
    if (finalBalance < initialBalance * 0.1) finalBalance = initialBalance * 0.1; 
    if (finalBalance <= 0) finalBalance = 1; // Minimum balance

    const netResult = finalBalance - initialBalance;
    const totalReturn = (netResult / initialBalance) * 100;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0; // High if no losses and profit

    // Max drawdown calculation (based on minBalanceReached for martingale)
    if (config.martingale.enabled) {
        maxDrawdown = ((initialBalance - minBalanceReached) / initialBalance) * 100;
        if (maxDrawdown < 0) maxDrawdown = 0; // Drawdown cannot be negative
    }

    const newResults = {
      totalReturn: parseFloat(totalReturn.toFixed(2)),
      winRate: winRate,
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      totalTrades: totalTrades,
      wins: wins,
      losses: losses,
      finalBalance: parseFloat(finalBalance.toFixed(2)),
      netResult: parseFloat(netResult.toFixed(2)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      payout: payout,
      actualStake: actualStake,
      strategy: strategy.name
    };

    setResults(newResults);

    // Gerar Curva de Capital - more realistic spread over days
    let balance = initialBalance;
    const newEquityData = [];
    const dailyChangeFactor = Math.pow(1 + totalReturn / 100, 1 / (days > 0 ? days : 1)); // Average daily growth

    for (let i = 0; i <= Math.floor(days); i++) {
        const date = new Date(config.startDate);
        date.setDate(date.getDate() + i);
        if (i > 0) {
            // Add some randomness to daily balance changes
            balance *= (dailyChangeFactor + getRandom(-0.02, 0.02)); // +/- 2% daily variance
        }
        newEquityData.push({ date: date.toISOString().split('T')[0], balance: Math.round(balance) });
    }
    setEquityData(newEquityData);
  };

  const runBacktest = () => {
    setIsRunning(true);
    setResults(null);
    setTimeout(() => {
      generateSimulatedData();
      setIsRunning(false);
    }, 2000);
  };

  useEffect(() => {
    // Set default expiration based on selected strategy on initial mount
    setConfig(prev => ({
      ...prev,
      expiration: DERIV_STRATEGIES[prev.strategy].expiration
    }));
    generateSimulatedData();
  }, []);

  // Update expiration when strategy changes
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      expiration: DERIV_STRATEGIES[prev.strategy].expiration
    }));
  }, [config.strategy]);


  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Backtest para Deriv</h1>
          <p className="text-slate-400 text-lg">Teste suas estratégias nos índices sintéticos da Deriv</p>
        </div>
        <Button onClick={runBacktest} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700 min-w-[180px]">
          {isRunning ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Executando...</> : <><Play className="w-4 h-4 mr-2" /> Executar Backtest</>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Config Panel */}
        <Card className="premium-card">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="flex items-center gap-3 text-white">
              <TestTube className="w-5 h-5 text-blue-400" />
              Configuração Deriv
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Estratégia */}
            <div>
              <Label className="text-slate-300">Estratégia</Label>
              <Select value={config.strategy} onValueChange={(v) => handleConfigChange('strategy', v)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DERIV_STRATEGIES).map(([key, strategy]) => (
                    <SelectItem key={key} value={key}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400 mt-1">
                {DERIV_STRATEGIES[config.strategy].description}
              </p>
            </div>

            {/* Ativo */}
            <div>
              <Label className="text-slate-300">Ativo da Deriv</Label>
              <Select value={config.asset} onValueChange={(v) => handleConfigChange('asset', v)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="R_100">Volatility 100 Index</SelectItem>
                  <SelectItem value="R_75">Volatility 75 Index</SelectItem>
                  <SelectItem value="R_50">Volatility 50 Index</SelectItem>
                  <SelectItem value="R_25">Volatility 25 Index</SelectItem>
                  <SelectItem value="R_10">Volatility 10 Index</SelectItem>
                  <SelectItem value="BOOM1000">Boom 1000 Index</SelectItem>
                  <SelectItem value="CRASH1000">Crash 1000 Index</SelectItem>
                  <SelectItem value="BOOM500">Boom 500 Index</SelectItem>
                  <SelectItem value="CRASH500">Crash 500 Index</SelectItem>
                  <SelectItem value="STPUSD">Step Index</SelectItem>
                </SelectContent>
              </Select>
              {DERIV_STRATEGIES[config.strategy].bestAssets.includes(config.asset) && (
                <p className="text-xs text-green-400 mt-1">✅ Ativo recomendado para esta estratégia</p>
              )}
            </div>

            {/* Stake */}
            <div>
              <Label className="text-slate-300">Valor da Entrada</Label>
              <div className="flex gap-2">
                <Select value={config.stakeType} onValueChange={(v) => handleConfigChange('stakeType', v)}>
                  <SelectTrigger className="w-20 bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">$</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={config.stakeAmount}
                  onChange={(e) => handleConfigChange('stakeAmount', parseFloat(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Mín: $0.35 | Máx: $2000 (varia por ativo)
              </p>
            </div>

            {/* Expiração */}
            <div>
              <Label className="text-slate-300">Tempo de Expiração</Label>
              <Select value={config.expiration} onValueChange={(v) => handleConfigChange('expiration', v)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Minuto</SelectItem>
                  <SelectItem value="2m">2 Minutos</SelectItem>
                  <SelectItem value="3m">3 Minutos</SelectItem>
                  <SelectItem value="5m">5 Minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confiança Mínima */}
            <div>
              <Label className="text-slate-300">Confiança Mínima (%)</Label>
              <Input
                type="number"
                value={config.minConfidence}
                onChange={(e) => handleConfigChange('minConfidence', parseInt(e.target.value) || 70)}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            {/* Martingale */}
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300">Martingale</Label>
                <Switch
                  checked={config.martingale.enabled}
                  onCheckedChange={(v) => handleMartingaleChange('enabled', v)}
                />
              </div>
              {config.martingale.enabled && (
                <div className="space-y-2">
                  <div>
                    <Label className="text-slate-400 text-xs">Multiplicador</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={config.martingale.multiplier}
                      onChange={(e) => handleMartingaleChange('multiplier', parseFloat(e.target.value) || 2)}
                      className="bg-slate-800 border-slate-600 text-white h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Níveis Máximos</Label>
                    <Input
                      type="number"
                      value={config.martingale.maxLevels}
                      onChange={(e) => handleMartingaleChange('maxLevels', parseInt(e.target.value) || 3)}
                      className="bg-slate-800 border-slate-600 text-white h-8"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results ? (
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className={`premium-card ${results.totalReturn >= 0 ? 'profit-glow' : 'loss-glow'}`}>
                <CardContent className="p-4 text-center">
                  <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${results.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                  <p className={`text-2xl font-bold ${results.totalReturn >= 0 ? 'text-green-300' : 'text-red-300'}`}>{results.totalReturn >= 0 ? '+' : ''}{results.totalReturn.toFixed(2)}%</p>
                  <p className="text-xs text-slate-400">Retorno Total</p>
                </CardContent>
              </Card>
              <Card className="premium-card trading-glow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-300">{results.winRate.toFixed(2)}%</p>
                  <p className="text-xs text-slate-400">Taxa de Acerto</p>
                </CardContent>
              </Card>
              <Card className="premium-card purple-glow">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-300">${results.netResult.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">Resultado Líquido</p>
                </CardContent>
              </Card>
              <Card className="premium-card">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-300">{results.totalTrades}</p>
                  <p className="text-xs text-slate-400">Total de Trades</p>
                </CardContent>
              </Card>
              {/* New Cards for Max Drawdown and Profit Factor */}
              <Card className="premium-card loss-glow">
                <CardContent className="p-4 text-center">
                  <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-300">{results.maxDrawdown.toFixed(2)}%</p>
                  <p className="text-xs text-slate-400">Max. Drawdown</p>
                </CardContent>
              </Card>
              <Card className="premium-card profit-glow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-300">{results.profitFactor.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">Fator de Lucro</p>
                </CardContent>
              </Card>
              <Card className="premium-card trading-glow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-300">{results.wins}</p>
                  <p className="text-xs text-slate-400">Wins</p>
                </CardContent>
              </Card>
              <Card className="premium-card loss-glow">
                <CardContent className="p-4 text-center">
                  <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-300">{results.losses}</p>
                  <p className="text-xs text-slate-400">Losses</p>
                </CardContent>
              </Card>
            </div>

            <Card className="premium-card">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="flex items-center gap-3 text-white">
                  <BarChart3 className="w-6 h-6 text-blue-400" /> Curva de Capital
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.5)" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} domain={['dataMin', 'dataMax']} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #475569', borderRadius: '8px', color: '#F1F5F9' }} formatter={(value) => [`$${value.toLocaleString()}`, "Saldo"]} />
                    <Line type="monotone" dataKey="balance" stroke={results.totalReturn >= 0 ? '#00FF88' : '#FF3366'} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-3 flex items-center justify-center h-full">
            <div className="text-center p-8">
              <RefreshCw className="w-12 h-12 text-blue-400 mx-auto animate-spin" />
              <p className="mt-4 text-slate-300 text-lg">Simulando operações na Deriv...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
