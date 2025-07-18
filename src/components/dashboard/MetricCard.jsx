
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({ title, value, trend, icon: Icon, type = "default" }) {
  const getCardStyle = () => {
    switch (type) {
      case 'profit':
        return 'premium-card profit-glow bg-gradient-to-br from-emerald-500/10 via-green-600/10 to-emerald-500/5';
      case 'loss':
        return 'premium-card loss-glow bg-gradient-to-br from-red-500/10 via-pink-600/10 to-red-500/5';
      case 'primary':
        return 'premium-card trading-glow bg-gradient-to-br from-blue-500/10 via-cyan-600/10 to-blue-500/5';
      default:
        return 'premium-card bg-gradient-to-br from-slate-700/20 via-slate-800/30 to-slate-700/10';
    }
  };

  const getValueColor = () => {
    switch (type) {
      case 'profit':
        return 'text-emerald-300';
      case 'loss':
        return 'text-red-300';
      case 'primary':
        return 'text-blue-300';
      default:
        return 'text-white';
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    return trend.startsWith('+') || trend.includes('↑') ? 'text-emerald-400' : 'text-red-400';
  };

  const getIconBgStyle = () => {
    switch (type) {
      case 'profit':
        return 'bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/30';
      case 'loss':
        return 'bg-gradient-to-br from-red-500/20 to-pink-600/20 border border-red-500/30';
      case 'primary':
        return 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30';
      default:
        return 'bg-gradient-to-br from-slate-600/30 to-slate-700/30 border border-slate-500/30';
    }
  };

  return (
    <Card className={`${getCardStyle()} transition-all duration-300 hover:scale-[1.02]`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300 uppercase tracking-wider">{title}</p>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${getValueColor()}`}>{value}</p>
              {trend && (
                <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                  {trend.startsWith('+') || trend.includes('↑') ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="font-medium">{trend}</span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${getIconBgStyle()}`}>
            <Icon className={`w-6 h-6 ${getValueColor()}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
