
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";

export default function RiskMeter({ riskLevel = 35, maxRisk = 100 }) {
  const getRiskColor = () => {
    if (riskLevel <= 30) return 'text-emerald-400';
    if (riskLevel <= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLabel = () => {
    if (riskLevel <= 30) return 'Risco Baixo';
    if (riskLevel <= 60) return 'Risco Moderado';
    return 'Risco Alto';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (riskLevel / maxRisk) * circumference;

  return (
    <Card className="premium-card">
      <CardHeader className="border-b border-slate-600/30">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-lg border border-blue-500/30">
            <Gauge className="w-5 h-5 text-blue-400" />
          </div>
          Medidor de Risco
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#475569"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-500 ${getRiskColor()}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-2xl font-bold ${getRiskColor()}`}>{riskLevel}%</span>
              <span className="text-xs text-slate-300">Risco</span>
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className={`font-semibold ${getRiskColor()}`}>{getRiskLabel()}</p>
          <p className="text-sm text-slate-300 mt-1">Nível de exposição atual</p>
        </div>
      </CardContent>
    </Card>
  );
}
