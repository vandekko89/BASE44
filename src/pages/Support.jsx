
import React, { useState } from "react";
import { HelpCircle, MessageSquare, Book, Phone, Mail, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function Support() {
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    priority: "medium"
  });

  const systemHealth = {
    overall: "healthy",
    aiEngine: "running",
    dataFeed: "connected",
    broker: "connected",
    lastCheck: "2 minutes ago"
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'running':
      case 'connected':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Central de Suporte</h1>
          <p className="text-slate-400 text-lg">Obtenha ajuda e monitore a saúde do sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(systemHealth.overall)} border`}>
            <CheckCircle className="w-3 h-3 mr-1" />
            Sistema {systemHealth.overall === 'healthy' ? 'Saudável' : 'com Problemas'}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                Criar Ticket de Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Assunto</Label>
                  <Input
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    placeholder="Breve descrição do problema"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Descrição</Label>
                  <Textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    placeholder="Descrição detalhada, passos para reproduzir, etc."
                    className="bg-slate-800 border-slate-600 text-white h-32"
                  />
                </div>

                <div className="flex gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 flex-1">
                    Enviar Ticket
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Anexar Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                <HelpCircle className="w-6 h-6 text-blue-400" />
                Ajuda Rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Book className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">Documentação</h3>
                  <p className="text-slate-400 text-sm mb-3">Guias e tutoriais completos</p>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Ver Docs
                  </Button>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <MessageSquare className="w-8 h-8 text-green-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">Chat Ao Vivo</h3>
                  <p className="text-slate-400 text-sm mb-3">Converse com nossa equipe de suporte</p>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Iniciar Chat
                  </Button>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Phone className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">Suporte por Telefone</h3>
                  <p className="text-slate-400 text-sm mb-3">Ligue para nossa linha de suporte premium</p>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Ligar Agora
                  </Button>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Mail className="w-8 h-8 text-orange-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">Suporte por E-mail</h3>
                  <p className="text-slate-400 text-sm mb-3">Envie-nos um e-mail detalhado</p>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Enviar E-mail
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Saúde do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Motor IA</span>
                  <Badge className={`${getStatusColor(systemHealth.aiEngine)} border`}>
                    {systemHealth.aiEngine === 'running' ? 'Executando' : 'Parado'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Feed de Dados</span>
                  <Badge className={`${getStatusColor(systemHealth.dataFeed)} border`}>
                    {systemHealth.dataFeed === 'connected' ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Conexão da Corretora</span>
                  <Badge className={`${getStatusColor(systemHealth.broker)} border`}>
                    {systemHealth.broker === 'connected' ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                  <p className="text-xs text-slate-400">
                    Última verificação: {systemHealth.lastCheck}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-white">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                FAQ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white text-sm">Como resetar minhas chaves de API?</h4>
                  <p className="text-slate-400 text-xs mt-1">Vá para Configurações → Conexão com Corretora</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white text-sm">Por que meu bot não está operando?</h4>
                  <p className="text-slate-400 text-xs mt-1">Verifique suas configurações de estratégia e o limite de confiança</p>
                </div>

                <div>
                  <h4 className="font-medium text-white text-sm">Como fazer backup da minha configuração?</h4>
                  <p className="text-slate-400 text-xs mt-1">Use Configurações → Segurança → Exportar Dados</p>
                </div>

                <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  Ver Todas as FAQs
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card trading-glow">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="font-bold text-white mb-2">Suporte Premium</h3>
                <p className="text-slate-300 text-sm mb-4">Suporte prioritário 24/7 com gerente de conta dedicado</p>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                  Fazer Upgrade Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
