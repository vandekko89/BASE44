

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  BarChart3,
  Settings,
  Bot,
  FileText,
  TestTube,
  HelpCircle,
  Book // Added Book icon import
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { MarketDataProvider } from "@/components/providers/MarketDataContext";
import { SettingsProvider } from "@/components/providers/SettingsContext";

const navigationItems = [
  {
    title: "Terminal Binário",
    url: createPageUrl("BinaryTerminal"),
    icon: BarChart3,
  },
  {
    title: "Backtest",
    url: createPageUrl("Backtest"),
    icon: TestTube,
  },
  {
    title: "Motor IA",
    url: createPageUrl("AI"),
    icon: Bot,
  },
  {
    title: "Logs",
    url: createPageUrl("Logs"),
    icon: FileText,
  },
  {
    title: "Configurações",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
  {
    title: "Suporte",
    url: createPageUrl("Support"),
    icon: HelpCircle,
  },
  { // New navigation item added
    title: "Conexão Deriv", // Updated title as per instructions
    url: createPageUrl("DerivAPIResearch"),
    icon: Book,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SettingsProvider>
      <MarketDataProvider>
        <SidebarProvider>
          <style>
            {`
            :root {
              --background: 11 20 38;
              --foreground: 255 255 255;
              --primary: 0 212 255;
              --primary-foreground: 11 20 38;
              --secondary: 139 157 195;
              --secondary-foreground: 11 20 38;
              --accent: 0 255 136;
              --accent-foreground: 11 20 38;
              --destructive: 255 51 102;
              --destructive-foreground: 255 255 255;
              --muted: 51 65 85;
              --muted-foreground: 148 163 184;
              --card: 15 23 42;
              --card-foreground: 255 255 255;
              --border: 51 65 85;
              --input: 51 65 85;
              --ring: 0 212 255;
            }
            
            body {
              background: linear-gradient(135deg, #0B1426 0%, #1E293B 50%, #334155 100%);
              color: white;
              font-family: 'Inter', system-ui, sans-serif;
            }
            
            .premium-card {
              background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8));
              border: 1px solid rgba(71, 85, 105, 0.4);
              backdrop-filter: blur(20px);
              box-shadow: 
                0 4px 32px rgba(0, 0, 0, 0.3),
                0 1px 0 rgba(255, 255, 255, 0.1) inset,
                0 0 0 1px rgba(255, 255, 255, 0.05);
            }
            
            .premium-card:hover {
              box-shadow: 
                0 8px 40px rgba(0, 0, 0, 0.4),
                0 1px 0 rgba(255, 255, 255, 0.15) inset,
                0 0 0 1px rgba(255, 255, 255, 0.1);
              transform: translateY(-2px);
            }
            
            .trading-glow {
              box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
            }
            
            .profit-glow {
              box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
            }
            
            .loss-glow {
              box-shadow: 0 0 30px rgba(255, 51, 102, 0.4);
            }
            
            .purple-glow {
              box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);
            }

            .warning-glow {
              box-shadow: 0 0 30px rgba(251, 191, 36, 0.4);
            }

            .glass-effect {
              background: rgba(15, 23, 42, 0.6);
              backdrop-filter: blur(16px);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .sidebar-premium {
              background-color: #0f172a;
              background-image: 
                radial-gradient(circle at 10% 20%, rgba(0, 212, 255, 0.1), transparent 30%),
                radial-gradient(circle at 90% 80%, rgba(0, 255, 136, 0.08), transparent 40%),
                linear-gradient(160deg, #0b1426 0%, #172441 100%);
              border-right: 1px solid rgba(71, 85, 105, 0.4);
              backdrop-filter: blur(24px);
              box-shadow: 
                4px 0 32px rgba(0, 0, 0, 0.3),
                1px 0 0 rgba(255, 255, 255, 0.08) inset;
            }

            .logo-glow {
              filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.6));
              animation: pulse-glow 3s ease-in-out infinite alternate;
            }
            
            @keyframes pulse-glow {
              from { filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.6)); }
              to { filter: drop-shadow(0 0 30px rgba(0, 255, 136, 0.8)); }
            }
            
            .nav-item {
              background: linear-gradient(145deg, rgba(15, 23, 42, 0.3), rgba(30, 41, 59, 0.2));
              border: 1px solid rgba(71, 85, 105, 0.2);
              backdrop-filter: blur(10px);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .nav-item:hover {
              background: linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1));
              border: 1px solid rgba(59, 130, 246, 0.3);
              box-shadow: 
                0 4px 16px rgba(59, 130, 246, 0.2),
                0 1px 0 rgba(255, 255, 255, 0.1) inset;
              transform: translateX(4px);
            }
            
            .nav-item-active {
              background: linear-gradient(145deg, rgba(0, 212, 255, 0.2), rgba(0, 160, 255, 0.15));
              border: 1px solid rgba(0, 212, 255, 0.4);
              box-shadow: 
                0 4px 20px rgba(0, 212, 255, 0.3),
                0 1px 0 rgba(255, 255, 255, 0.15) inset;
              transform: translateX(6px);
              position: relative;
            }
            
            .nav-item-active::before {
              content: '';
              position: absolute;
              left: -1px;
              top: 25%;
              bottom: 25%;
              width: 4px;
              background: linear-gradient(180deg, #00D4FF, #00FF88);
              border-radius: 0 8px 8px 0;
              box-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
            }
            
            .status-indicator {
              background: linear-gradient(145deg, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.4));
              border: 1px solid rgba(71, 85, 105, 0.3);
              backdrop-filter: blur(10px);
            }
            
            .user-profile {
              background: linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
              border: 1px solid rgba(71, 85, 105, 0.4);
              backdrop-filter: blur(15px);
              box-shadow: 
                0 4px 20px rgba(0, 0, 0, 0.3),
                0 1px 0 rgba(255, 255, 255, 0.1) inset;
            }
          `}
          </style>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700">
            <Sidebar className="sidebar-premium">
              <SidebarHeader className="border-b border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 p-1">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e4e96f854_fotor-202507082613.png"
                      alt="EdgeAI Binary Engine Logo"
                      className="w-full h-full object-cover rounded-lg logo-glow"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-white">EdgeAI Binary</h2>
                    <p className="text-xs text-blue-300 font-medium">Precisão em Segundos</p>
                  </div>
                </div>
              </SidebarHeader>

              <SidebarContent className="p-4">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-bold text-slate-300 uppercase tracking-wider px-4 py-3 mb-2">
                    Terminal de Trading
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-2">
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`
                              nav-item rounded-xl px-4 py-3 text-slate-200 font-medium
                              ${(location.pathname === item.url || (item.title === "Terminal Binário" && currentPageName === "BinaryTerminal")) ? 'nav-item-active text-blue-300' : ''}
                            `}
                          >
                            <Link to={item.url} className="flex items-center gap-3">
                              <item.icon className="w-5 h-5" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-8">
                  <SidebarGroupLabel className="text-xs font-bold text-slate-300 uppercase tracking-wider px-4 py-3 mb-2">
                    Status do Sistema
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <div className="px-4 py-4 status-indicator rounded-xl">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-300 font-medium">Motor IA Ativo</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-300 font-medium">Mercado Conectado</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-yellow-300 font-medium">Monitorando</span>
                        </div>
                      </div>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-slate-700/50 p-6">
                <div className="user-profile rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TC</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm">Trader CEO</p>
                      <p className="text-xs text-blue-300">Licença Profissional</p>
                    </div>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>

            <main className="flex-1 flex flex-col">
              <header className="glass-effect border-b border-slate-600/30 px-6 py-4 md:hidden">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="hover:bg-slate-600 p-2 rounded-lg transition-colors duration-200" />
                  <div className="flex items-center gap-3">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e4e96f854_fotor-202507082613.png"
                      alt="EdgeAI Binary Engine Logo"
                      className="w-8 h-8 object-cover rounded-lg logo-glow"
                    />
                    <h1 className="text-xl font-bold text-white">EdgeAI Binary</h1>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900/60 to-blue-900/40">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </MarketDataProvider>
    </SettingsProvider>
  );
}

