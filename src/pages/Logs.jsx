
import React, { useState, useEffect } from "react";
import { SystemLog } from "@/api/entities";
import { FileText, AlertTriangle, Info, Bug, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  const mockLogs = [
    {
      id: 1,
      level: "info",
      message: "AI model training completed successfully",
      module: "AI Engine",
      details: { accuracy: 87.3, epochs: 1250 },
      timestamp: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      level: "warning",
      message: "High volatility detected in EUR/USD",
      module: "Risk Manager",
      details: { volatility: 2.8, threshold: 2.5 },
      timestamp: "2024-01-15T10:25:00Z"
    },
    {
      id: 3,
      level: "error",
      message: "Failed to connect to broker API",
      module: "Broker Adapter",
      details: { broker: "Demo", error: "Timeout" },
      timestamp: "2024-01-15T10:20:00Z"
    },
    {
      id: 4,
      level: "info",
      message: "Trade executed successfully",
      module: "Trade Engine",
      details: { symbol: "EUR/USD", side: "buy", price: 1.2543 },
      timestamp: "2024-01-15T10:15:00Z"
    },
    {
      id: 5,
      level: "debug",
      message: "Indicator values calculated",
      module: "Technical Analysis",
      details: { RSI: 34.5, MACD: 0.0023 },
      timestamp: "2024-01-15T10:10:00Z"
    }
  ];

  useEffect(() => {
    setLogs(mockLogs);
  }, []);

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'debug':
        return <Bug className="w-4 h-4 text-gray-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'info':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'debug':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const logCounts = {
    total: logs.length,
    error: logs.filter(l => l.level === 'error').length,
    warning: logs.filter(l => l.level === 'warning').length,
    info: logs.filter(l => l.level === 'info').length,
    debug: logs.filter(l => l.level === 'debug').length
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Logs do Sistema</h1>
          <p className="text-slate-400 text-lg">Monitore a atividade do sistema e depure problemas</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <FileText className="w-4 h-4 mr-2" />
            Exportar Logs
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Limpar Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Logs</p>
                <p className="text-2xl font-bold text-white">{logCounts.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card loss-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Erros</p>
                <p className="text-2xl font-bold text-red-300">{logCounts.error}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card warning-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avisos</p>
                <p className="text-2xl font-bold text-yellow-300">{logCounts.warning}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card trading-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Info</p>
                <p className="text-2xl font-bold text-blue-300">{logCounts.info}</p>
              </div>
              <Info className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Debug</p>
                <p className="text-2xl font-bold text-gray-300">{logCounts.debug}</p>
              </div>
              <Bug className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 mb-6">
        {[{key: 'all', label: 'Todos'}, {key: 'error', label: 'Erro'}, {key: 'warning', label: 'Aviso'}, {key: 'info', label: 'Info'}, {key: 'debug', label: 'Debug'}].map((level) => (
          <button
            key={level.key}
            onClick={() => setFilter(level.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === level.key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3 h-3" />
            {level.label}
          </button>
        ))}
      </div>

      <Card className="premium-card">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="flex items-center gap-3 text-white">
            <FileText className="w-6 h-6 text-blue-400" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">Nível</TableHead>
                  <TableHead className="text-slate-300">Mensagem</TableHead>
                  <TableHead className="text-slate-300">Módulo</TableHead>
                  <TableHead className="text-slate-300">Hora</TableHead>
                  <TableHead className="text-slate-300">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-slate-700 hover:bg-slate-800/30">
                    <TableCell>
                      <Badge className={`${getLevelColor(log.level)} border flex items-center gap-1 w-fit`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white max-w-md">
                      <span className="truncate block">{log.message}</span>
                    </TableCell>
                    <TableCell className="text-slate-300">{log.module}</TableCell>
                    <TableCell className="text-slate-300">
                      {format(new Date(log.timestamp), 'HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {log.details && (
                        <code className="text-xs bg-slate-800/50 px-2 py-1 rounded">
                          {JSON.stringify(log.details).slice(0, 50)}...
                        </code>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
