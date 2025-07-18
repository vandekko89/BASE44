
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { TradingStrategy } from '@/api/entities';
import { useSettings } from './SettingsContext';

const MarketDataContext = createContext();

export const useMarketData = () => useContext(MarketDataContext);

const initialIndicators = [
    { name: "RSI", value: 50, signal: "neutral", confidence: 50, enabled: true, params: { period: 14 } },
    { name: "MACD", value: 0, signal: "neutral", confidence: 50, enabled: true, params: { fast: 12, slow: 26, signal: 9 } },
    { name: "Bollinger Bands", value: 1.25, signal: "neutral", confidence: 50, enabled: true, params: { period: 20, stdDev: 2 } },
    { name: "ADX", value: 20, signal: "neutral", confidence: 50, enabled: true, params: { period: 14 } },
    { name: "Stochastic", value: 50, signal: "neutral", confidence: 50, enabled: true, params: { k: 14, d: 3 } },
    { name: "EMA 50", value: 1.25, signal: "neutral", confidence: 50, enabled: true, params: { period: 50 } },
    { name: "SMA 200", value: 1.25, signal: "neutral", confidence: 50, enabled: true, params: { period: 200 } },
    { name: "Ichimoku Cloud", value: 1.25, signal: "neutral", confidence: 50, enabled: true },
    { name: "Supertrend", value: 1.25, signal: "neutral", confidence: 50, enabled: true, params: { period: 10, multiplier: 3 } },
    { name: "News Sentiment", value: 0, signal: "neutral", confidence: 50, enabled: true },
];

export const MarketDataProvider = ({ children }) => {
  const { config } = useSettings();
  
  const [candleHistory, setCandleHistory] = useState([]);
  const [activeStrategy, setActiveStrategy] = useState(null);
  
  // O estado 'indicators' agora contém todos os dados, incluindo os de performance
  const [indicators, setIndicators] = useState([]);

  // Armazena a performance histórica de cada indicador
  const indicatorPerformanceRef = useRef(
    initialIndicators.reduce((acc, ind) => {
        acc[ind.name] = { wins: 0, total: 0 };
        return acc;
    }, {})
  );
  
  const [isActive, setIsActive] = useState(false);
  const toggleRobot = () => setIsActive(!isActive);

  useEffect(() => {
    const simulationInterval = setInterval(() => {
        // --- 1. SIMULAÇÃO DE PREÇO REALISTA COM WICKS ---
        const lastCandle = candleHistory.length > 0 ? candleHistory[candleHistory.length - 1] : { close: 10000 };
        const open = lastCandle.close;
        const volatility = 4.0; // Aumentar volatilidade para candles mais visíveis

        // Simular movimentos intra-vela para gerar high/low realistas
        const priceMovements = [open];
        let currentPrice = open;
        const moves = 10; // Simular 10 movimentos de preço dentro da vela
        for(let i = 0; i < moves; i++) {
          currentPrice += (Math.random() - 0.5) * (volatility / moves) * 2;
          priceMovements.push(currentPrice);
        }

        const high = Math.max(...priceMovements);
        const low = Math.min(...priceMovements);
        const close = priceMovements[priceMovements.length - 1];

        const newCandle = {
          open: parseFloat(open.toFixed(4)),
          high: parseFloat(high.toFixed(4)),
          low: parseFloat(low.toFixed(4)),
          close: parseFloat(close.toFixed(4)),
          time: Date.now()
        };
        
        // Aumentar o histórico para 500 velas (mais de 8 minutos de dados)
        setCandleHistory(prev => [...prev.slice(-500), newCandle]);

        // --- 2. GERAÇÃO DE SINAIS MAIS REALISTA ---
        const updatedIndicators = initialIndicators.map(ind => {
            // Simular análise técnica mais realista
            let signal;
            let confidence;
            
            // Diferentes indicadores têm diferentes comportamentos
            if (ind.name === 'RSI') {
                const rsiValue = 30 + Math.random() * 40; // RSI entre 30-70
                if (rsiValue < 35) {
                    signal = 'buy';
                    confidence = Math.min(90, 50 + (35 - rsiValue) * 2);
                } else if (rsiValue > 65) {
                    signal = 'sell';
                    confidence = Math.min(90, 50 + (rsiValue - 65) * 2);
                } else {
                    signal = 'neutral';
                    confidence = 30 + Math.random() * 20;
                }
            } else if (ind.name === 'MACD') {
                const trend = Math.random() - 0.5;
                if (trend > 0.2) {
                    signal = 'buy';
                    confidence = 50 + Math.random() * 35;
                } else if (trend < -0.2) {
                    signal = 'sell';
                    confidence = 50 + Math.random() * 35;
                } else {
                    signal = 'neutral';
                    confidence = 30 + Math.random() * 25;
                }
            } else {
                // Outros indicadores com lógica básica
                const randomSignal = Math.random();
                if (randomSignal < 0.35) {
                    signal = 'buy';
                    confidence = Math.round(45 + Math.random() * 40);
                } else if (randomSignal < 0.7) {
                    signal = 'sell';
                    confidence = Math.round(45 + Math.random() * 40);
                } else {
                    signal = 'neutral';
                    confidence = Math.round(30 + Math.random() * 30);
                }
            }
            
            return {
                ...ind,
                value: parseFloat((close + (Math.random() - 0.5) * 0.001).toFixed(4)),
                signal,
                confidence: Math.round(Math.max(25, Math.min(95, confidence))) // Garantir limites
            };
        });

        // --- 3. SISTEMA DE APRENDIZADO MELHORADO ---
        if (isActive) {
            const enabledIndicators = updatedIndicators.filter(i => i.enabled && i.confidence >= 30);
            
            // Simular resultado apenas se houver indicadores válidos
            if (enabledIndicators.length >= 2) {
                const buySignals = enabledIndicators.filter(i => i.signal === 'buy').length;
                const sellSignals = enabledIndicators.filter(i => i.signal === 'sell').length;
                
                let tradeDecision = 'hold';
                // Decisão de trade baseada na maioria e em um limiar mínimo de 60% de concordância
                if (buySignals > sellSignals && buySignals >= enabledIndicators.length * 0.6) {
                    tradeDecision = 'buy';
                } else if (sellSignals > buySignals && sellSignals >= enabledIndicators.length * 0.6) {
                    tradeDecision = 'sell';
                }

                if (tradeDecision !== 'hold') {
                    // Simular resultado baseado na qualidade dos sinais
                    const indicatorsForDecision = enabledIndicators.filter(i => i.signal === tradeDecision);
                    const avgConfidence = indicatorsForDecision.length > 0 
                        ? indicatorsForDecision.reduce((sum, i) => sum + i.confidence, 0) / indicatorsForDecision.length
                        : 50; // Fallback se algo der errado

                    // Resultado mais provável com maior confiança
                    const winProbability = Math.min(85, Math.max(45, avgConfidence * 0.8)); // Win prob between 45% and 85%
                    const tradeResult = Math.random() * 100 < winProbability ? 'win' : 'loss';
                    
                    // Atualizar performance de cada indicador
                    enabledIndicators.forEach(ind => {
                        const perf = indicatorPerformanceRef.current[ind.name];
                        perf.total += 1;
                        
                        // Recompensar indicadores que acertaram a direção (tradeDecision)
                        // OU que estavam em desacordo e o trade resultou em perda (ou seja, o indicador estava "certo" ao não apoiar o trade)
                        if ((ind.signal === tradeDecision && tradeResult === 'win') ||
                            (ind.signal !== tradeDecision && tradeResult === 'loss')) {
                            perf.wins += 1;
                        }
                    });
                }
            }
        }

        // --- 4. RECALCULAR PESOS E ATUALIZAR ESTADO ---
        const indicatorsWithPerformance = updatedIndicators.map(ind => {
            const perf = indicatorPerformanceRef.current[ind.name];
            let accuracy = perf.total > 5 ? (perf.wins / perf.total) * 100 : 50;
            
            // Sistema de pesos mais conservador
            let weight = 0.5 + (accuracy / 100) * 1.0; // Mapeia 50% -> 1.0, 100% -> 1.5
            
            // Penalizar indicadores com poucos dados
            if (perf.total < 10) {
                weight *= 0.8;
            }
            
            return {
                ...ind,
                accuracy: Math.round(accuracy * 100) / 100, // Arredondar para 2 casas decimais
                weight: Math.round(weight * 100) / 100,     // Arredondar para 2 casas decimais
                totalTrades: perf.total
            }
        });

        setIndicators(indicatorsWithPerformance);

    }, 1000); // Roda a cada segundo

    return () => clearInterval(simulationInterval);
  }, [isActive, candleHistory]);

  const value = {
    candleHistory,
    indicators,
    activeStrategy,
    isActive,
    toggleRobot,
    // Remover estados e funções que não são mais necessários
    executedTrades: [], 
    robotStatus: 'stopped', 
    currentTrade: null,
    metrics: {},
    refreshActiveStrategy: () => {},
    connectionStatus: 'connected',
    strategiesLoaded: true,
    liveTick: null,
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
};
