import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

// Configuração inicial padrão - Simplificada e correta
const initialConfig = {
  theme: "dark",
  language: "pt",
  notifications: { email: true, push: false, sms: false },
  broker: {
    accountType: "demo", // Apenas o tipo de conta é necessário aqui
    apiKey: "", // Um único token para tudo
    status: "disconnected",
    lastConnection: null,
    accountInfo: null,
    balance: null // Fonte única e confiável do saldo
  },
  alerts: { highVolatility: true, systemErrors: true, tradeExecutions: true }
};

export const SettingsProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    try {
      const savedConfig = localStorage.getItem('traderBotConfig');
      const parsedConfig = savedConfig ? JSON.parse(savedConfig) : {};
      
      // Merge inteligente para garantir que a estrutura esteja sempre atualizada
      const finalConfig = {
        ...initialConfig,
        ...parsedConfig,
        broker: {
          ...initialConfig.broker,
          ...(parsedConfig.broker || {}),
        },
      };

      // Limpeza de campos antigos para evitar conflitos
      if (finalConfig.broker.apiKeys) {
        finalConfig.broker.apiKey = finalConfig.broker.apiKeys.demo || finalConfig.broker.apiKeys.real || '';
        delete finalConfig.broker.apiKeys;
      }
      
      return finalConfig;

    } catch (error) {
      console.error("Falha ao carregar configuração do localStorage", error);
      return initialConfig;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('traderBotConfig', JSON.stringify(config));
    } catch (error) {
      console.error("Falha ao salvar configuração no localStorage", error);
    }
  }, [config]);

  const value = { config, setConfig };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};