
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function IndicatorCard({ name, value, signal, confidence, enabled = true }) {
  const getSignalIcon = () => {
    switch (signal) {
      case 'buy':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSignalColor = () => {
    switch (signal) {
      case 'buy':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'sell':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className={`premium-card transition-all duration-300 hover:scale-105 ${!enabled ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">{name}</h3>
            <div className="flex items-center gap-1">
              {getSignalIcon()}
              <Badge className={`${getSignalColor()} border text-xs px-2 py-0.5`}>
                {signal === 'buy' ? 'COMPRA' : signal === 'sell' ? 'VENDA' : 'NEUTRO'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Valor</span>
              <span className="font-mono text-white text-sm">{value}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Confiança</span>
              <span className={`font-bold text-sm ${getConfidenceColor()}`}>{confidence}%</span>
            </div>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                confidence >= 80 ? 'bg-green-400' : 
                confidence >= 60 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
