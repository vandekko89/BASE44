
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown, Minus, Zap, AlertTriangle } from "lucide-react";

// LÓGICA REVISADA DE ANÁLISE TÉCNICA
const analyzeIndicators = (indicators, activeStrategy) => {
  if (!indicators || indicators.length === 0) {
    return {
      finalDecision: 'hold',
      confidence: 0,
      reasoning: ['Nenhum indicador disponível'],
      details: { buySignals: 0, sellSignals: 0, neutralSignals: 0, validIndicators: 0, totalIndicators: 0, weightedConfidence: 0, decisionStrength: 0, consensusPercentage: 0, buyPercentage: 0, sellPercentage: 0 },
      analysisQuality: 'poor'
    };
  }

  // Filtrar apenas indicadores habilitados
  const enabledIndicators = indicators.filter(ind => ind.enabled);
  
  if (enabledIndicators.length === 0) {
    return {
      finalDecision: 'hold',
      confidence: 0,
      reasoning: ['Todos os indicadores estão desabilitados'],
      details: { buySignals: 0, sellSignals: 0, neutralSignals: 0, validIndicators: 0, totalIndicators: 0, weightedConfidence: 0, decisionStrength: 0, consensusPercentage: 0, buyPercentage: 0, sellPercentage: 0 },
      analysisQuality: 'poor'
    };
  }

  // VALIDAÇÃO DOS INDICADORES
  const validIndicators = enabledIndicators.filter(ind => {
    return ind.confidence >= 30 && // Confiança mínima
           ind.signal && ['buy', 'sell', 'neutral'].includes(ind.signal) &&
           typeof ind.value === 'number' &&
           !isNaN(ind.value);
  });

  if (validIndicators.length === 0) {
    return {
      finalDecision: 'hold',
      confidence: 0,
      reasoning: ['Nenhum indicador com dados válidos'],
      details: { buySignals: 0, sellSignals: 0, neutralSignals: 0, validIndicators: 0, totalIndicators: enabledIndicators.length, weightedConfidence: 0, decisionStrength: 0, consensusPercentage: 0, buyPercentage: 0, sellPercentage: 0 },
      analysisQuality: 'poor'
    };
  }

  // Separar sinais por tipo
  const buySignals = validIndicators.filter(ind => ind.signal === 'buy');
  const sellSignals = validIndicators.filter(ind => ind.signal === 'sell');
  const neutralSignals = validIndicators.filter(ind => ind.signal === 'neutral');

  // CÁLCULO DE CONFIANÇA PONDERADA (corrigido)
  const totalWeight = validIndicators.reduce((sum, ind) => sum + (ind.weight || 1), 0);
  let weightedConfidence = 0;
  
  if (totalWeight > 0) {
    weightedConfidence = validIndicators.reduce((sum, ind) => {
      const weight = ind.weight || 1;
      return sum + (ind.confidence * weight);
    }, 0) / totalWeight;
  }

  // ANÁLISE DE CONSENSO
  const totalSignals = validIndicators.length;
  const buyPercentage = (buySignals.length / totalSignals) * 100;
  const sellPercentage = (sellSignals.length / totalSignals) * 100;
  const neutralPercentage = (neutralSignals.length / totalSignals) * 100;

  // DETERMINAÇÃO DA DECISÃO FINAL (lógica melhorada)
  let finalDecision = 'hold';
  let decisionStrength = 0;
  let analysisQuality = 'poor';

  // Exigir consenso mínimo para operação
  const MINIMUM_CONSENSUS = 60; // 60% dos indicadores devem concordar

  if (buyPercentage >= MINIMUM_CONSENSUS && buyPercentage > sellPercentage) {
    finalDecision = 'buy';
    decisionStrength = buyPercentage;
    analysisQuality = buyPercentage >= 80 ? 'excellent' : buyPercentage >= 70 ? 'good' : 'fair';
  } else if (sellPercentage >= MINIMUM_CONSENSUS && sellPercentage > buyPercentage) {
    finalDecision = 'sell';
    decisionStrength = sellPercentage;
    analysisQuality = sellPercentage >= 80 ? 'excellent' : sellPercentage >= 70 ? 'good' : 'fair';
  } else {
    finalDecision = 'hold';
    decisionStrength = Math.max(buyPercentage, sellPercentage, neutralPercentage); // Represents the max consensus, even if not enough for decision
    analysisQuality = 'poor';
  }

  // CÁLCULO DE CONFIANÇA FINAL (reformulado)
  let finalConfidence = 0;
  
  if (finalDecision !== 'hold') {
    // Combinar força da decisão com confiança média dos indicadores
    const consensusWeight = 0.4;
    const confidenceWeight = 0.6;
    
    finalConfidence = (decisionStrength * consensusWeight) + (weightedConfidence * confidenceWeight);
    
    // Penalizar se poucos indicadores participam
    if (validIndicators.length < 3) {
      finalConfidence *= 0.8; // 20% penalty
    }
    
    // Penalizar sinais conflitantes
    const conflictPenalty = Math.min(buyPercentage, sellPercentage) / 100; // Value between 0 and 1
    finalConfidence *= (1 - conflictPenalty * 0.3); // Up to 30% penalty based on conflict
  }

  finalConfidence = Math.max(0, Math.min(100, Math.round(finalConfidence)));

  // APLICAR FILTRO DE ESTRATÉGIA
  const minConfidence = activeStrategy?.min_confidence_threshold || 70;
  if (finalConfidence < minConfidence) {
    finalDecision = 'hold';
    analysisQuality = 'poor'; // Downgrade quality if strategy threshold is not met
  }

  // GERAR REASONING DETALHADO
  const reasoning = [];
  
  if (finalDecision !== 'hold') {
    reasoning.push(`${Math.round(decisionStrength)}% dos indicadores concordam com ${finalDecision === 'buy' ? 'COMPRA' : 'VENDA'}`);
    reasoning.push(`Confiança média ponderada: ${Math.round(weightedConfidence)}%`);
    
    // Mostrar indicadores mais confiáveis
    const strongIndicators = validIndicators
      .filter(ind => ind.signal === finalDecision && ind.confidence >= 70)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);
    
    if (strongIndicators.length > 0) {
      reasoning.push(`Indicadores fortes: ${strongIndicators.map(ind => `${ind.name} (${ind.confidence}%)`).join(', ')}`);
    }
    
    // Alertar sobre conflitos
    const oppositeSignals = finalDecision === 'buy' ? sellSignals.length : buySignals.length;
    if (oppositeSignals > 0) {
      reasoning.push(`⚠️ ${oppositeSignals} indicador(es) sugerem direção oposta`);
    }
  } else {
    if (finalConfidence < minConfidence && finalConfidence > 0) {
      reasoning.push(`Confiança ${finalConfidence}% abaixo do mínimo de ${minConfidence}%`);
    } else if (decisionStrength < MINIMUM_CONSENSUS) {
      reasoning.push(`Consenso insuficiente (${Math.round(Math.max(buyPercentage, sellPercentage))}% < ${MINIMUM_CONSENSUS}%)`);
    } else {
      reasoning.push('Sinais muito conflitantes entre os indicadores');
    }
    reasoning.push(`Distribuição: ${buySignals.length} compra, ${sellSignals.length} venda, ${neutralSignals.length} neutro`);
  }

  // Informações de qualidade da análise
  if (validIndicators.length < enabledIndicators.length) {
    reasoning.push(`⚠️ ${enabledIndicators.length - validIndicators.length} indicador(es) com dados inválidos`);
  }

  return {
    finalDecision,
    confidence: finalConfidence,
    reasoning,
    details: {
      buySignals: buySignals.length,
      sellSignals: sellSignals.length,
      neutralSignals: neutralSignals.length,
      validIndicators: validIndicators.length,
      totalIndicators: enabledIndicators.length,
      weightedConfidence: Math.round(weightedConfidence),
      decisionStrength: Math.round(decisionStrength),
      consensusPercentage: Math.round(decisionStrength),
      buyPercentage: Math.round(buyPercentage),
      sellPercentage: Math.round(sellPercentage)
    },
    analysisQuality
  };
};

export default function DecisionPanel({ 
  activeStrategy = null,
  indicators = []
}) {
  const [analysis, setAnalysis] = useState({
    finalDecision: 'hold',
    confidence: 0,
    reasoning: ['Aguardando dados...'],
    details: { buySignals: 0, sellSignals: 0, neutralSignals: 0, validIndicators: 0, totalIndicators: 0, weightedConfidence: 0, decisionStrength: 0, consensusPercentage: 0, buyPercentage: 0, sellPercentage: 0 },
    analysisQuality: 'poor'
  });

  // Reanalisar sempre que os indicadores mudarem
  useEffect(() => {
    const newAnalysis = analyzeIndicators(indicators, activeStrategy);
    setAnalysis(newAnalysis);
    
    // Log detalhado para debug
    console.log('🧠 Análise de Indicadores:', {
      indicadores_habilitados: indicators.filter(i => i.enabled).length,
      indicadores_válidos: newAnalysis.details.validIndicators,
      decisão: newAnalysis.finalDecision,
      confiança: newAnalysis.confidence,
      qualidade: newAnalysis.analysisQuality,
      detalhes: newAnalysis.details
    });
  }, [indicators, activeStrategy]);

  const getDecisionIcon = (decision) => {
    switch (decision) {
      case 'buy':
        return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case 'sell':
        return <TrendingDown className="w-6 h-6 text-red-400" />;
      default:
        return <Minus className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'buy':
        return 'text-emerald-300 bg-gradient-to-r from-emerald-500/20 to-green-600/20 border-emerald-500/40';
      case 'sell':
        return 'text-red-300 bg-gradient-to-r from-red-500/20 to-pink-600/20 border-red-500/40';
      default:
        return 'text-yellow-300 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border-yellow-500/40';
    }
  };

  const getConfidenceColor = () => {
    if (analysis.confidence >= 80) return 'text-emerald-400';
    if (analysis.confidence >= 60) return 'text-yellow-400';
    if (analysis.confidence >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getDecisionText = (decision) => {
    switch (decision) {
      case 'buy':
        return 'COMPRA';
      case 'sell':
        return 'VENDA';
      default:
        return 'AGUARDAR';
    }
  };

  const getQualityColor = () => {
    switch (analysis.analysisQuality) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'fair':
        return 'text-yellow-400';
      default:
        return 'text-red-400';
    }
  };

  const getQualityLabel = () => {
    switch (analysis.analysisQuality) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Boa';
      case 'fair':
        return 'Regular';
      default:
        return 'Fraca';
    }
  };

  return (
    <Card className="premium-card">
      <CardHeader className="border-b border-slate-600/30">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-lg border border-blue-500/30 flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-400" />
          </div>
          Análise de Entrada
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Decisão Final */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getDecisionIcon(analysis.finalDecision)}
              <div>
                <Badge className={`${getDecisionColor(analysis.finalDecision)} border text-sm font-bold px-3 py-1`}>
                  {getDecisionText(analysis.finalDecision)}
                </Badge>
                <p className="text-sm text-slate-300 mt-1">Sinal Final</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getConfidenceColor()}`}>{analysis.confidence}%</p>
              <p className="text-sm text-slate-300">Confiança</p>
            </div>
          </div>

          {/* Qualidade da Análise */}
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-slate-200 font-medium">Qualidade da Análise</h4>
              <Badge className={`${getQualityColor().replace('text-', 'bg-').replace('-400', '-500/20')} ${getQualityColor()} border-${getQualityColor().replace('text-', '').replace('-400', '-500/30')}`}>
                {getQualityLabel()}
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center text-sm mb-4">
              <div>
                <p className="text-green-300 font-bold">{analysis.details.buySignals}</p>
                <p className="text-slate-400">Compra</p>
              </div>
              <div>
                <p className="text-red-300 font-bold">{analysis.details.sellSignals}</p>
                <p className="text-slate-400">Venda</p>
              </div>
              <div>
                <p className="text-yellow-300 font-bold">{analysis.details.neutralSignals}</p>
                <p className="text-slate-400">Neutro</p>
              </div>
              <div>
                <p className="text-blue-300 font-bold">{analysis.details.validIndicators}/{analysis.details.totalIndicators}</p>
                <p className="text-slate-400">Válidos</p>
              </div>
            </div>
          </div>

          {/* Reasoning Detalhado */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Análise Detalhada
            </h4>
            <div className="space-y-2">
              {analysis.reasoning.map((reason, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className={`text-slate-200 ${reason.includes('⚠️') ? 'text-yellow-300' : ''}`}>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filtro de Estratégia */}
          {activeStrategy && (
            <div className="pt-4 border-t border-slate-600/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Estratégia Ativa:</span>
                <span className="text-blue-300 font-medium">{activeStrategy.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-slate-400">Confiança Mínima:</span>
                <span className="text-slate-300">{activeStrategy.min_confidence_threshold || 70}%</span>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="pt-4 border-t border-slate-600/30">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Última análise: {new Date().toLocaleTimeString()}</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Analisando Live</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
