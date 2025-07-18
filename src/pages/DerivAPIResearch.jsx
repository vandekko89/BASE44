
import React, { useState, useEffect } from "react";
import { useSettings } from "@/components/providers/SettingsContext";
import { 
  Shield, 
  Zap, 
  Settings as SettingsIcon, 
  Eye, 
  EyeOff, 
  Wifi, 
  WifiOff,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import derivApiManager from "@/components/api/DerivAPI";

export default function DerivConnection() {
  const { config, setConfig } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [allBalances, setAllBalances] = useState([]);

  // Use the provided API key for initial state to facilitate testing
  useEffect(() => {
    handleConfigChange('apiKey', 'pXT5mxB9rFZ67RI');
  }, []);

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      broker: { ...prev.broker, [field]: value }
    }));
  };

  const handleConnect = async () => {
    if (!config.broker.apiKey) {
      setConnectionError("Por favor, insira seu token de API.");
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    setAllBalances([]); // Clear allBalances on new connection attempt

    try {
      console.log(`🚀 Conectando usando API minimalista...`);
      // The connect function should return accountData with loginid, balance, currency, is_virtual, and potentially account_type, requested_type from the token.
      const accountData = await derivApiManager.connect(config.broker.apiKey, config.broker.accountType);
      
      setConfig(prev => ({
        ...prev,
        broker: {
          ...prev.broker,
          status: 'connected',
          lastConnection: new Date().toISOString(),
          accountInfo: accountData, // accountData should include loginid, balance, currency, is_virtual, account_type, requested_type
          balance: accountData.balance // main account balance
        }
      }));

      // Se temos lista de contas, armazenar
      if (accountData.all_accounts && accountData.all_accounts.length > 0) {
        setAllBalances(accountData.all_accounts.map(acc => ({
          ...acc,
          // For minimalist version, if all_accounts doesn't provide balances for all,
          // explicitly set the active account's balance and currency, others to N/A.
          balance: acc.loginid === accountData.loginid ? accountData.balance : 'N/A',
          currency: acc.loginid === accountData.loginid ? accountData.currency : 'N/A'
        })));
      }

      console.log('✅ Conexão estabelecida:', accountData);
      setConnectionError(null);
      
    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      
      setConnectionError(error.message || 'Erro desconhecido na conexão.');

      setConfig(prev => ({
        ...prev,
        broker: { ...prev.broker, status: 'error' }
      }));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    derivApiManager.disconnect();
    setConfig(prev => ({
      ...prev,
      broker: {
        ...prev.broker,
        status: 'disconnected',
        accountInfo: null,
        balance: null
      }
    }));
    setAllBalances([]);
    setConnectionError(null);
  };

  const refreshBalances = async () => {
    if (config.broker.status !== 'connected' || !derivApiManager.fullAuthResponse) return;
    
    try {
        const balances = await derivApiManager.getAllBalances();
        setAllBalances(balances);

        // Atualizar saldo da conta ativa no contexto principal
        const activeAccount = balances.find(acc => acc.loginid === config.broker.accountInfo.loginid);
        if (activeAccount) {
            setConfig(prev => ({
                ...prev,
                broker: {
                    ...prev.broker,
                    balance: parseFloat(activeAccount.balance)
                }
            }));
        }
    } catch (error) {
      console.error('Erro ao atualizar saldos:', error);
      // Opcional: mostrar erro na UI
    }
  };

  const getConnectionStatus = () => {
    switch (config.broker.status) {
      case 'connected':
        return { color: 'text-green-300', bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'Conectado' };
      case 'connecting':
        return { color: 'text-yellow-300', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'Conectando...' };
      case 'error':
        return { color: 'text-red-300', bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'Erro' };
      default:
        return { color: 'text-slate-300', bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'Desconectado' };
    }
  };

  const status = getConnectionStatus();

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Conexão Deriv</h1>
          <p className="text-slate-400 text-lg">Configure a conexão com sua conta Demo ou Real</p>
        </div>
        <Badge className={`${status.bg} ${status.color} ${status.border} border px-4 py-2 text-sm font-medium`}>
          {config.broker.status === 'connected' ? <Wifi className="w-4 h-4 mr-2" /> : <WifiOff className="w-4 h-4 mr-2" />}
          {status.text}
        </Badge>
      </div>

      {/* Alerta para Conta Real */}
      {config.broker.status === 'connected' && !config.broker.accountInfo?.is_virtual && (
        <Card className="premium-card bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="font-bold text-red-300 mb-2">ATENÇÃO: CONTA REAL CONECTADA</h3>
                <p className="text-red-200 text-sm mb-4">
                  Você está conectado à sua conta REAL com dinheiro verdadeiro!
                  <br />• Para testes seguros, crie um token para a conta DEMO
                  <br />• Acesse: app.deriv.com/account/api-token (certifique-se de estar na conta Demo)
                  <br />• Configure permissões: Read + Trade
                </p>
                <div className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                  💡 Dica: No canto superior direito da Deriv deve mostrar "Demo" em verde antes de criar o token
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta para Conta Demo */}
      {config.broker.status === 'connected' && config.broker.accountInfo?.is_virtual && (
        <Card className="premium-card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-bold text-green-300 mb-2">CONTA DEMO CONECTADA</h3>
                <p className="text-green-200 text-sm">
                  Perfeito! Você está conectado à conta Demo com dinheiro virtual.
                  <br />• Ambiente seguro para testes e desenvolvimento
                  <br />• Todos os trades usarão dinheiro virtual
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="premium-card bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-2xl">🔧</div>
            <div>
              <h3 className="font-bold text-blue-300 mb-2">VERSÃO SIMPLIFICADA PARA TESTE</h3>
              <p className="text-blue-200 text-sm mb-4">
                Esta versão conecta à primeira conta disponível no seu token, sem tentar trocar entre Demo/Real.
                <br />• Elimina o erro "Unrecognised request"
                <br />• Mostra qual tipo de conta está conectada
                <br />• Funciona com qualquer token válido da Deriv
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="premium-card">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="flex items-center gap-3 text-white">
              <SettingsIcon className="w-5 h-5 text-blue-400" />
              Configuração da Conexão
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-slate-300 font-medium">Tipo de Conta Preferido</Label>
              <p className="text-xs text-slate-400 mb-3">
                Nota: Esta versão conectará à conta disponível no token. A seleção abaixo é apenas informativa.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    config.broker.accountType === "demo"
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                  }`}
                  onClick={() => handleConfigChange('accountType', 'demo')}
                >
                  <div className="text-center">
                    <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <h4 className="font-medium text-white">Conta Demo</h4>
                    <p className="text-slate-400 text-xs mt-1">Preferência</p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    config.broker.accountType === "real"
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                  }`}
                  onClick={() => handleConfigChange('accountType', 'real')}
                >
                  <div className="text-center">
                    <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <h4 className="font-medium text-white">Conta Real</h4>
                    <p className="text-slate-400 text-xs mt-1">Preferência</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-300 font-medium">API Token</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={config.broker.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  placeholder="Cole seu token de API da Deriv aqui"
                  className="bg-slate-800 border-slate-600 text-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {connectionError && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3 text-red-300">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Erro de Conexão</h4>
                    <span className="text-sm">{connectionError}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {config.broker.status === 'connected' ? (
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-300 hover:bg-red-900/20"
                >
                  Desconectar
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || !config.broker.apiKey}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    'Conectar'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                💰 Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {config.broker.status === 'connected' && config.broker.balance !== null ? (
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                    config.broker.accountInfo?.is_virtual 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {config.broker.accountInfo?.is_virtual ? '🟢' : '🔴'}
                    Conta {config.broker.accountInfo?.is_virtual ? 'DEMO' : 'REAL'}
                  </div>
                  <p className={`text-4xl font-bold mb-2 ${
                    config.broker.accountInfo?.is_virtual ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {config.broker.accountInfo?.currency || 'USD'} {config.broker.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-sm">
                      {config.broker.accountInfo?.is_virtual ? 'Dinheiro Virtual para Testes' : 'Dinheiro Real'}
                    </p>
                    <p className="text-slate-500 text-xs">
                      ID da Conta: {config.broker.accountInfo?.loginid}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-slate-400">Conecte-se para ver informações da conta</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instruções para Criar Token Demo */}
          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                🔧 Como Criar Token Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                  <p className="text-slate-300">Acesse <span className="text-blue-300 font-mono">app.deriv.com/account/api-token</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                  <p className="text-slate-300">Certifique-se de estar na conta <span className="text-green-400 font-bold">Demo</span> (canto superior direito)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                  <p className="text-slate-300">Clique em "Create new token"</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                  <p className="text-slate-300">Ative permissões: <span className="text-blue-300">Read</span> + <span className="text-blue-300">Trade</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">5</span>
                  <p className="text-slate-300">Copie o token e cole no campo acima</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Todas as Contas */}
          {allBalances.length > 0 && (
            <Card className="premium-card">
              <CardHeader className="border-b border-slate-700/50 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-white">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  Todas as Contas
                </CardTitle>
                 <Button
                  onClick={refreshBalances}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Atualizar Saldos
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {allBalances.map((account, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{account.loginid}</p>
                        <p className="text-xs text-slate-400">
                          {account.is_virtual ? 'Demo' : 'Real'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          {account.currency} {account.balance !== 'N/A' ? parseFloat(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                        </p>
                        {account.loginid === config.broker.accountInfo?.loginid && (
                          <Badge className="bg-blue-500/20 text-blue-300 text-xs mt-1">Ativa</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                📊 Status da Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge className={status.bg + ' ' + status.color}>
                    {status.text}
                  </Badge>
                </div>
                
                {config.broker.accountInfo && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tipo de Conta:</span>
                      <Badge className={config.broker.accountInfo.is_virtual ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}>
                        {config.broker.accountInfo.is_virtual ? "Demo" : "Real"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Moeda:</span>
                      <span className="text-white">{config.broker.accountInfo.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Login ID:</span>
                      <span className="text-white font-mono text-xs">{config.broker.accountInfo.loginid}</span>
                    </div>
                  </>
                )}
                
                {config.broker.lastConnection && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Última Conexão:</span>
                    <span className="text-slate-300 text-xs">
                      {new Date(config.broker.lastConnection).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
