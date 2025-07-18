import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

export default function IndicatorPanel({ indicators = [] }) {
  // Calcular consenso dos indicadores
  const calculateConsensus = () => {
    if (!indicators.length) return { signal: 'neutral', strength: 0, buyCount: 0, sellCount: 0, neutralCount: 0 };
    
    const buyCount = indicators.filter(ind => ind.signal === 'buy' && ind.enabled).length;
    const sellCount = indicators.filter(ind => ind.signal === 'sell' && ind.enabled).length;
    const neutralCount = indicators.filter(ind => ind.signal === 'neutral' && ind.enabled).length;
    const totalEnabled = indicators.filter(ind => ind.enabled).length;
    
    let signal = 'neutral';
    let strength = 0;
    
    if (buyCount > sellCount && buyCount > neutralCount) {
      signal = 'buy';
      strength = (buyCount / totalEnabled) * 100;
    } else if (sellCount > buyCount && sellCount > neutralCount) {
      signal = 'sell';
      strength = (sellCount / totalEnabled) * 100;
    } else {
      signal = 'neutral';
      strength = Math.max(buyCount, sellCount, neutralCount) / totalEnabled * 100;
    }
    
    return { signal, strength: Math.round(strength), buyCount, sellCount, neutralCount };
  };

  const consensus = calculateConsensus();

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'buy':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'buy':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'sell':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const getConsensusColor = () => {
    if (consensus.strength >= 70) return 'text-green-400';
    if (consensus.strength >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="premium-card">
      <CardHeader className="border-b border-slate-600/30">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            Análise Técnica
          </div>
          <Badge className={`${getSignalColor(consensus.signal)} border px-3 py-1`}>
            {consensus.signal.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Consenso Geral */}
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-slate-200 font-medium">Consenso dos Indicadores</h4>
              <span className={`font-bold text-lg ${getConsensusColor()}`}>
                {consensus.strength}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <p className="text-green-300 font-bold">{consensus.buyCount}</p>
                <p className="text-slate-400">Compra</p>
              </div>
              <div>
                <p className="text-red-300 font-bold">{consensus.sellCount}</p>
                <p className="text-slate-400">Venda</p>
              </div>
              <div>
                <p className="text-yellow-300 font-bold">{consensus.neutralCount}</p>
                <p className="text-slate-400">Neutro</p>
              </div>
            </div>
          </div>

          {/* Lista de Indicadores */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-medium mb-3">Indicadores Individuais</h4>
            {indicators.map((indicator, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border transition-opacity ${
                indicator.enabled ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-800/10 border-slate-700/20 opacity-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getSignalIcon(indicator.signal)}
                    <span className="text-slate-200 font-medium">{indicator.name}</span>
                  </div>
                  {!indicator.enabled && (
                    <Badge variant="outline" className="text-xs text-slate-500 border-slate-600">
                      Desabilitado
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-slate-300 font-mono text-sm">
                    {typeof indicator.value === 'number' ? indicator.value.toFixed(4) : indicator.value}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${getSignalColor(indicator.signal)} text-xs px-2 py-0.5`}>
                      {indicator.signal.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {indicator.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {indicators.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aguardando dados dos indicadores...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}