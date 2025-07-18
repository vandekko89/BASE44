
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Shield, AlertTriangle } from "lucide-react";

export default function EntryConfigPanel({ config, onConfigChange }) {
  const handleChange = (field, value) => {
    onConfigChange(field, value);
  };

  const handleMartingaleChange = (field, value) => {
    onConfigChange('martingale', { ...config.martingale, [field]: value });
  };

  const calculateNextStake = () => {
    if (!config.martingale.enabled) return config.stakeAmount;
    return config.stakeAmount * Math.pow(config.martingale.multiplier, 1);
  };

  const calculateMaxRisk = () => {
    if (!config.martingale.enabled) return config.stakeAmount;
    
    let totalRisk = 0;
    for (let i = 0; i < config.martingale.maxLevels; i++) {
      totalRisk += config.stakeAmount * Math.pow(config.martingale.multiplier, i);
    }
    return totalRisk;
  };

  return (
    <Card className="premium-card">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="flex items-center gap-3 text-white">
          <DollarSign className="w-5 h-5 text-green-400" />
          Configurações de Entrada
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Valor da Entrada */}
        <div className="space-y-3">
          <Label className="text-slate-300 font-medium">Valor da Entrada</Label>
          <div className="flex gap-3">
            <Select value={config.stakeType} onValueChange={(value) => handleChange('stakeType', value)}>
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
              onChange={(e) => handleChange('stakeAmount', parseFloat(e.target.value) || 0)}
              className="bg-slate-800 border-slate-600 text-white"
              min={config.stakeType === 'fixed' ? "0.35" : "0.1"}
              max={config.stakeType === 'fixed' ? "2000" : "100"}
              step={config.stakeType === 'fixed' ? "0.01" : "0.1"}
            />
          </div>
          <p className="text-xs text-slate-400">
            {config.stakeType === 'fixed' 
              ? 'Valor fixo em USD (min: $0.35, max: $2000)' 
              : 'Porcentagem do saldo (min: 0.1%, max: 100%)'
            }
          </p>
        </div>

        {/* Tempo de Expiração */}
        <div className="space-y-3">
          <Label className="text-slate-300 font-medium">Tempo de Expiração</Label>
          <Select value={config.expiration} onValueChange={(value) => handleChange('expiration', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Minuto</SelectItem>
              <SelectItem value="2m">2 Minutos</SelectItem>
              <SelectItem value="3m">3 Minutos</SelectItem>
              <SelectItem value="5m">5 Minutos</SelectItem>
              <SelectItem value="15m">15 Minutos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Confiança Mínima */}
        <div className="space-y-3">
          <Label className="text-slate-300 font-medium">Confiança Mínima</Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={config.minConfidence}
              onChange={(e) => handleChange('minConfidence', parseInt(e.target.value) || 70)}
              className="bg-slate-800 border-slate-600 text-white"
              min="50"
              max="95"
            />
            <span className="text-slate-400 text-sm">%</span>
          </div>
          <p className="text-xs text-slate-400">
            Mínimo de confiança para executar trades
          </p>
        </div>

        {/* Martingale */}
        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300 font-medium">Sistema Martingale</Label>
              <p className="text-xs text-slate-400">Aumenta stake após loss</p>
            </div>
            <Switch
              checked={config.martingale.enabled}
              onCheckedChange={(value) => handleMartingaleChange('enabled', value)}
            />
          </div>
          
          {config.martingale.enabled && (
            <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400 text-sm">Multiplicador</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.martingale.multiplier}
                    onChange={(e) => handleMartingaleChange('multiplier', parseFloat(e.target.value) || 2)}
                    className="bg-slate-800 border-slate-600 text-white h-8"
                    min="1.1"
                    max="5.0"
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Máx. Níveis</Label>
                  <Input
                    type="number"
                    value={config.martingale.maxLevels}
                    onChange={(e) => handleMartingaleChange('maxLevels', parseInt(e.target.value) || 3)}
                    className="bg-slate-800 border-slate-600 text-white h-8"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              
              {/* Previsão de Risco */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-900/50 p-3 rounded">
                  <p className="text-xs text-slate-400">Próximo Stake</p>
                  <p className="text-sm font-bold text-yellow-300">
                    {config.stakeType === 'fixed' 
                      ? `$${calculateNextStake().toFixed(2)}`
                      : `${calculateNextStake().toFixed(1)}%`
                    }
                  </p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded">
                  <p className="text-xs text-slate-400">Risco Máximo</p>
                  <p className="text-sm font-bold text-red-300">
                    {config.stakeType === 'fixed' 
                      ? `$${calculateMaxRisk().toFixed(2)}`
                      : `${calculateMaxRisk().toFixed(1)}%`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                <span>Martingale aumenta significativamente o risco</span>
              </div>
            </div>
          )}
        </div>

        {/* Resumo das Configurações */}
        <div className="pt-4 border-t border-slate-700/50">
          <Label className="text-slate-300 font-medium mb-3 block">Resumo da Configuração</Label>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Stake Base:</span>
              <span className="text-white font-medium">
                {config.stakeType === 'fixed' ? `$${config.stakeAmount}` : `${config.stakeAmount}%`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Expiração:</span>
              <span className="text-white font-medium">{config.expiration}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Confiança Mín:</span>
              <span className="text-white font-medium">{config.minConfidence}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Martingale:</span>
              <Badge className={`${config.martingale.enabled ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                {config.martingale.enabled ? 'Ativado' : 'Desativado'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
