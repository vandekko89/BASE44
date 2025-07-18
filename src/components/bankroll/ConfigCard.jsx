import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfigCard({ title, icon: Icon, children, className = "" }) {
  return (
    <Card className={`premium-card ${className}`}>
      <CardHeader className="border-b border-slate-600/30">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-lg border border-blue-500/30">
            <Icon className="w-5 h-5 text-blue-400" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}