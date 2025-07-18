import React, { useState, useEffect } from "react";
import { useMarketData } from "@/components/providers/MarketDataContext";
import { Brain, Zap, Target, TrendingUp, Settings, Play, Newspaper, Percent, BarChartHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const ModelPerformanceCard = ({ model }) => {
  const getWeightColor = (weight) => {
    if (weight > 1.5) return "text-emerald-400";
    if (weight > 1) return "text-blue-400";
    if (weight > 0.7) return "text-yellow-400";
    return "text-red-400";
  };
  
  const getAccuracyColor = (accuracy) => {
    if (accuracy > 75) return "text-emerald-300";
    if (accuracy > 60) return "text-blue-300";
    if (accuracy > 50) return "text-yellow-300";
    return "text-red-300";
  };

  const getIconForModel = (name) => {
    if (name.toLowerCase().includes('news')) return <Newspaper className="w-5 h-5 text-purple-400"/>;
    if (name.toLowerCase().includes('supertrend')) return <TrendingUp className="w-5 h-5 text-green-400"/>;
    if (name.toLowerCase().includes('rsi')) return <BarChartHorizontal className="w-5 h-5 text-orange-400"/>;
    return <Zap className="w-5 h-5 text-slate-400"/>;
  }

  return (
    <div className={`p-4 rounded-lg border transition-all duration-300 ${model.enabled ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-900/20 border-slate-800/30 opacity-60'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {getIconForModel(model.name)}
            <h4 className="font-semibold text-white">{model.name}</h4>
          </div>
          <Badge className={`${model.enabled ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
            {model.enabled ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-900/50 p-3 rounded">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Assertividade</p>
                <p className={`text-lg font-bold ${getAccuracyColor(model.accuracy)}`}>
                    {model.accuracy.toFixed(1)}%
                </p>
            </div>
            <div className="bg-slate-900/50 p-3 rounded">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Peso Atual</p>
                <p className={`text-lg font-bold ${getWeightColor(model.weight)}`}>
                    {model.weight.toFixed(2)}x
                </p>
            </div>
        </div>
        <div className="mt-3">
            <p className="text-xs text-slate-500 text-center">Testes Realizados: {model.totalTrades}</p>
        </div>
    </div>
  )
}

export default function AI() {
  const { indicators } = useMarketData();
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const startTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };
  
  const totalWeight = indicators.reduce((sum, ind) => sum + (ind.enabled ? ind.weight : 0), 0);
  const avgAccuracy = indicators.length > 0 
    ? indicators.reduce((sum, ind) => sum + (ind.enabled ? ind.accuracy : 0), 0) / indicators.filter(ind => ind.enabled).length
    : 0;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e4e96f854_fotor-202507082613.png" 
              alt="EdgeAI Engine Logo"
              className="w-12 h-12 object-cover rounded-xl"
              style={{ filter: 'drop-shadow(0 0 15px rgba(0, 212, 255, 0.5))' }}
            />
            <h1 className="text-4xl font-bold text-white">EdgeAI Learning Engine</h1>
          </div>
          <p className="text-slate-400 text-lg">Ponderação dinâmica de modelos baseada em performance histórica.</p>
        </div>
         <div className="flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-lg border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 font-medium text-sm">Aprendizado Ativo</span>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="premium-card trading-glow">
          <CardContent className="p-6 text-center">
            <Percent className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-300">{avgAccuracy.toFixed(1)}%</p>
            <p className="text-xs text-slate-400">Assertividade Média Ponderada</p>
          </CardContent>
        </Card>
        <Card className="premium-card profit-glow">
           <CardContent className="p-6 text-center">
            <BarChartHorizontal className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-300">{totalWeight.toFixed(2)}x</p>
            <p className="text-xs text-slate-400">Soma Total dos Pesos</p>
          </CardContent>
        </Card>
        <Card className="premium-card purple-glow">
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-300">{indicators.filter(i => i.enabled).length}</p>
            <p className="text-xs text-slate-400">Modelos Ativos</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="premium-card">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="flex items-center gap-3 text-white">
            <Zap className="w-6 h-6 text-blue-400" />
            Performance dos Modelos de Análise
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {indicators
                .sort((a,b) => b.weight - a.weight)
                .map((model, index) => (
                    <ModelPerformanceCard key={index} model={model} />
            ))}
            {indicators.length === 0 && <p className="text-slate-400 col-span-full text-center">Carregando modelos...</p>}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}