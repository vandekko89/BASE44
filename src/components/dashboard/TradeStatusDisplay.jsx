
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, ArrowRight, Hourglass, Zap } from "lucide-react";

// Componente para contagem regressiva
const TimeLeft = ({ expiration }) => {
  // expiration is expected to be a Unix timestamp in seconds
  // Date.now() is in milliseconds, so convert to seconds
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.round(expiration - (Date.now() / 1000))));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = Math.max(0, Math.round(expiration - (Date.now() / 1000)));
      setTimeLeft(newTimeLeft);
      
      // O onFinish não é mais necessário aqui, a API nos dirá quando acabar
      // No longer calling onFinish, as the external system handles trade completion.
      // The timer just displays remaining time.
    }, 1000);

    return () => clearInterval(timer);
  }, [expiration]); // Dependency array updated

  return <p className="text-4xl font-bold text-white">{timeLeft}s</p>;
};

export default function TradeStatusDisplay({ activeTrade, lastTradeResult, onTradeFinish }) {
  // Estado 1: Aguardando sinal
  if (!activeTrade && !lastTradeResult) {
    return (
      <Card className="premium-card h-full flex items-center justify-center">
        <CardContent className="p-6 text-center">
          <Hourglass className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }}/>
          <h3 className="text-2xl font-bold text-white">Aguardando Sinal</h3>
          <p className="text-slate-400 mt-2">O motor EdgeAI está analisando o mercado em busca de oportunidades.</p>
        </CardContent>
      </Card>
    );
  }

  // Estado 2: Trade ativo (contrato real da API)
  if (activeTrade) {
    // New structure from API: shortcode, buy_price, payout, contract_type, expiry_time, symbol
    const { shortcode, buy_price, payout, contract_type, expiry_time, symbol } = activeTrade;
    const isCall = contract_type === 'CALL'; // Logic for CALL/PUT based on contract_type

    return (
      <Card className={`premium-card border-2 ${isCall ? 'border-emerald-500/50 trading-glow' : 'border-red-500/50 loss-glow'}`}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-white">Trade Real em Andamento</CardTitle>
          <p className="text-slate-400">{symbol}</p>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            {isCall ? 
              <TrendingUp className="w-16 h-16 text-emerald-400" /> : 
              <TrendingDown className="w-16 h-16 text-red-400" />
            }
            <div className={`text-4xl font-black ${isCall ? 'text-emerald-300' : 'text-red-300'}`}>
              {isCall ? 'CALL' : 'PUT'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left p-4 bg-slate-800/50 rounded-lg">
            <div>
                <p className="text-sm text-slate-400">Entrada (Preço)</p>
                {/* entry_tick might not be available immediately, default to 0 */}
                <p className="font-bold text-white text-lg">{(activeTrade.entry_tick || 0).toFixed(4)}</p>
            </div>
            <div>
                <p className="text-sm text-slate-400">Investimento</p>
                <p className="font-bold text-white text-lg">${buy_price.toFixed(2)}</p>
            </div>
             <div>
                <p className="text-sm text-slate-400">Payout Potencial</p>
                {/* Payout directly from API, not calculated from percentage */}
                <p className="font-bold text-emerald-300 text-lg">${(payout).toFixed(2)}</p>
            </div>
             <div>
                <p className="text-sm text-slate-400">ID do Contrato</p>
                <p className="font-bold text-slate-400 text-xs">{activeTrade.contract_id}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Tempo Restante</p>
            {/* expiration prop now uses expiry_time (seconds timestamp) */}
            <TimeLeft expiration={expiry_time} /> 
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado 3: Resultado do último trade (contrato real da API)
  if (lastTradeResult) {
    // New structure from API: profit, contract_type, entry_tick, exit_tick, symbol
    const { profit, contract_type, entry_tick, exit_tick, symbol } = lastTradeResult;
    const isWin = profit > 0; // Win/Loss based on profit being positive
    
    return (
        <Card className={`premium-card border-2 ${isWin ? 'border-green-500/50 profit-glow' : 'border-red-500/50 loss-glow'}`}>
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white">Resultado do Trade Real</CardTitle>
                <p className="text-slate-400">{symbol}</p>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                    {isWin ?
                      <CheckCircle2 className="w-16 h-16 text-green-400" /> :
                      <XCircle className="w-16 h-16 text-red-400" />
                    }
                    <div className={`text-5xl font-black ${isWin ? 'text-green-300' : 'text-red-300'}`}>
                        {isWin ? 'VITÓRIA' : 'DERROTA'}
                    </div>
                </div>
                 <div className="text-2xl font-bold text-white">
                    {/* Display profit directly, handle negative sign for loss */}
                    {profit >= 0 ? `+ $${profit.toFixed(2)}` : `- $${Math.abs(profit).toFixed(2)}`}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center p-4 bg-slate-800/50 rounded-lg">
                    <div>
                        <p className="text-sm text-slate-400">Entrada</p>
                        {/* entry_tick might not be available, default to 0 */}
                        <p className="font-bold text-white">{(entry_tick || 0).toFixed(4)}</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <ArrowRight className="w-6 h-6 text-slate-500 mt-4" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Saída</p>
                        {/* exit_tick might not be available, default to 0 */}
                        <p className="font-bold text-white">{(exit_tick || 0).toFixed(4)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  }

  return null;
}
