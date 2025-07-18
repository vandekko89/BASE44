import React, { useState, useEffect } from "react";
import { useSettings } from "@/components/providers/SettingsContext";
import { Settings as SettingsIcon, Bell, Globe, Palette, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Settings() {
  const { config, setConfig } = useSettings();

  const handleConfigChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-slate-400 text-lg">Configure suas preferências do bot</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Salvar Alterações
        </Button>
      </div>

      {/* Aviso de Redirecionamento para Conexão Deriv */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl">🔗</div>
          <div>
            <h3 className="font-bold text-blue-300 mb-2">CONFIGURAÇÃO DE CONEXÃO DERIV</h3>
            <p className="text-blue-200 text-sm mb-4">
              A configuração da conexão com a Deriv foi movida para uma página dedicada para evitar conflitos.
            </p>
            <Link
              to={createPageUrl("DerivAPIResearch")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Configurar Conexão Deriv
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                <Palette className="w-5 h-5 text-blue-400" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300">Tema</label>
                  <Select value={config.theme} onValueChange={(value) => setConfig({...config, theme: value})}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-slate-300">Idioma</label>
                  <Select value={config.language} onValueChange={(value) => setConfig({...config, language: value})}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                <Bell className="w-5 h-5 text-blue-400" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 font-medium">Notificações por E-mail</p>
                    <p className="text-slate-400 text-sm">Receba atualizações por e-mail</p>
                  </div>
                  <Switch
                    checked={config.notifications.email}
                    onCheckedChange={(value) => handleConfigChange('notifications', 'email', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 font-medium">Notificações Push</p>
                    <p className="text-slate-400 text-sm">Notificações push do navegador</p>
                  </div>
                  <Switch
                    checked={config.notifications.push}
                    onCheckedChange={(value) => handleConfigChange('notifications', 'push', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 font-medium">Alertas por SMS</p>
                    <p className="text-slate-400 text-sm">Alertas importantes por SMS</p>
                  </div>
                  <Switch
                    checked={config.notifications.sms}
                    onCheckedChange={(value) => handleConfigChange('notifications', 'sms', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                <SettingsIcon className="w-5 h-5 text-blue-400" />
                Preferências de Alerta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 font-medium">Alta Volatilidade</p>
                    <p className="text-slate-400 text-sm">Alertar sobre picos de volatilidade</p>
                  </div>
                  <Switch
                    checked={config.alerts.highVolatility}
                    onCheckedChange={(value) => handleConfigChange('alerts', 'highVolatility', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 font-medium">Erros de Sistema</p>
                    <p className="text-slate-400 text-sm">Notificar sobre erros do sistema</p>
                  </div>
                  <Switch
                    checked={config.alerts.systemErrors}
                    onCheckedChange={(value) => handleConfigChange('alerts', 'systemErrors', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 font-medium">Execuções de Trade</p>
                    <p className="text-slate-400 text-sm">Alertar sobre trades bem-sucedidos</p>
                  </div>
                  <Switch
                    checked={config.alerts.tradeExecutions}
                    onCheckedChange={(value) => handleConfigChange('alerts', 'tradeExecutions', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                <Shield className="w-5 h-5 text-blue-400" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  Alterar Senha
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  Habilitar 2FA
                </Button>
                <Button variant="outline" className="w-full border-red-600 text-red-300 hover:bg-red-900/20">
                  Exportar Dados
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                <Globe className="w-5 h-5 text-blue-400" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Versão</span>
                  <span className="text-white font-mono">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Build</span>
                  <span className="text-white font-mono">2024.01.15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tempo Ativo</span>
                  <span className="text-green-300 font-mono">15d 8h 42m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Licença</span>
                  <span className="text-blue-300">Profissional</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}