import React, { useState } from 'react';
import { InvokeLLM } from '@/api/integrations';

// Componente para pesquisar e analisar interfaces de SaaS de trading
export default function InterfaceAnalyzer() {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCompetitors = async () => {
    setIsAnalyzing(true);
    
    try {
      const uiAnalysis = await InvokeLLM({
        prompt: `
        Analise as interfaces de usuário dos principais SaaS de trading automatizado e bot de trading:

        1. 3Commas - Bot de trading de criptomoedas
        2. TradingView - Plataforma de análise técnica
        3. Coinrule - Automação de trading de crypto
        4. Cryptohopper - Bot trading platform
        5. Pionex - Exchange com bots integrados
        6. Bitsgap - Trading automation
        7. MetaTrader 5 - Plataforma forex
        8. eToro - Social trading platform

        Para cada plataforma, analise:
        - Layout principal e organização da informação
        - Como eles apresentam métricas de performance
        - Design dos botões de ação (start/stop trading)
        - Como mostram configurações de estratégia
        - Cores e temas utilizados
        - Elementos de gamificação ou engagement
        - Como lidam com dados complexos de forma simples
        - Hierarquia visual e fluxo do usuário
        - Elementos de confiança (badges, verificações, etc.)
        - Mobile responsiveness

        Identifique padrões de UX/UI que tornam essas interfaces intuitivas para traders iniciantes e avançados.
        `,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            common_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  description: { type: "string" },
                  benefit: { type: "string" }
                }
              }
            },
            color_schemes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  primary_colors: { type: "array", items: { type: "string" } },
                  why_effective: { type: "string" }
                }
              }
            },
            dashboard_layouts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  layout_description: { type: "string" },
                  key_elements: { type: "array", items: { type: "string" } }
                }
              }
            },
            user_onboarding: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  onboarding_flow: { type: "string" },
                  first_time_experience: { type: "string" }
                }
              }
            },
            performance_display: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  metrics_shown: { type: "array", items: { type: "string" } },
                  visualization_style: { type: "string" }
                }
              }
            },
            trust_elements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  element: { type: "string" },
                  purpose: { type: "string" },
                  implementation: { type: "string" }
                }
              }
            },
            mobile_optimization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  feature: { type: "string" },
                  mobile_approach: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  recommendation: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(uiAnalysis);
      console.log("🎨 Análise de UI/UX dos concorrentes:", uiAnalysis);
      
    } catch (error) {
      console.error("Erro na análise:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analysis, isAnalyzing, analyzeCompetitors };
}