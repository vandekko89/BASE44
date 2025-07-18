/**
 * DerivAPI.js
 * 
 * Implementação MINIMALISTA da API Deriv
 * Conecta, autoriza, busca saldo. SEM tentativas de troca de conta.
 * Baseado na documentação mais básica da Deriv.
 */
class DerivAPIManager {
  constructor() {
    this.socket = null;
    this.messageCounter = 1;
    this.pendingRequests = new Map();
    this.eventListeners = {};
    this.connectionStatus = 'disconnected';
    this.authData = null;
    this.currentBalance = null;
  }

  // --- Gerenciamento de Eventos ---
  on(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
  }

  off(eventName, callback) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName] = this.eventListeners[eventName].filter(
        listener => listener !== callback
      );
    }
  }

  emit(eventName, data) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].forEach(callback => callback(data));
    }
  }

  // --- Conexão Simples (SEM troca de conta) ---
  connect(apiToken, requestedAccountType = 'demo') {
    return new Promise((resolve, reject) => {
      this.connectionStatus = 'connecting';
      this.emit('status', 'connecting');
      
      // Fechar conexão anterior
      if (this.socket) {
        this.socket.close();
      }

      // Conectar WebSocket
      this.socket = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

      this.socket.onopen = () => {
        console.log('🔗 WebSocket conectado');
        
        // Passo 1: Autorizar
        this.sendRequest({ authorize: apiToken })
          .then(authResponse => {
            if (authResponse.error) {
              throw new Error(`Erro de autorização: ${authResponse.error.message}`);
            }
            
            if (!authResponse.authorize) {
              throw new Error('Resposta de autorização inválida');
            }
            
            console.log('✅ Autorização bem-sucedida:', authResponse.authorize);
            this.authData = authResponse.authorize;
            
            // Passo 2: Buscar saldo da conta atual (sem tentar trocar)
            return this.sendRequest({ balance: 1 });
          })
          .then(balanceResponse => {
            if (balanceResponse.error) {
              throw new Error(`Erro ao buscar saldo: ${balanceResponse.error.message}`);
            }
            
            if (!balanceResponse.balance) {
              throw new Error('Resposta de saldo inválida');
            }
            
            console.log('💰 Saldo obtido:', balanceResponse.balance);
            this.currentBalance = balanceResponse.balance;
            
            // Determinar tipo de conta atual
            const actualAccountType = this.authData.is_virtual ? 'demo' : 'real';
            
            // Preparar dados de retorno
            const accountData = {
              loginid: this.authData.loginid,
              is_virtual: this.authData.is_virtual,
              currency: this.currentBalance.currency,
              balance: parseFloat(this.currentBalance.balance),
              account_type: actualAccountType,
              requested_type: requestedAccountType,
              all_accounts: this.authData.account_list || []
            };
            
            this.connectionStatus = 'connected';
            this.emit('status', 'connected');
            this.emit('balance', this.currentBalance);
            
            console.log('🎉 Conexão concluída:', accountData);
            resolve(accountData);
          })
          .catch(error => {
            console.error('❌ Erro na conexão:', error);
            this.connectionStatus = 'error';
            this.emit('status', 'error');
            reject(error);
          });
      };

      this.socket.onmessage = this.handleMessage.bind(this);
      
      this.socket.onclose = () => {
        this.connectionStatus = 'disconnected';
        this.emit('status', 'disconnected');
        console.log('🔌 WebSocket desconectado');
      };
      
      this.socket.onerror = (error) => {
        console.error('❌ Erro WebSocket:', error);
        this.connectionStatus = 'error';
        this.emit('status', 'error');
        reject(new Error('Falha na conexão WebSocket'));
      };
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connectionStatus = 'disconnected';
    this.authData = null;
    this.currentBalance = null;
  }

  // --- Comunicação com API ---
  sendRequest(request) {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket não está conectado'));
        return;
      }

      const req_id = this.messageCounter++;
      this.pendingRequests.set(req_id, { resolve, reject });

      const message = { ...request, req_id };
      console.log('>>> Enviando:', message);
      this.socket.send(JSON.stringify(message));

      // Timeout de 10 segundos
      setTimeout(() => {
        if (this.pendingRequests.has(req_id)) {
          this.pendingRequests.delete(req_id);
          reject(new Error(`Timeout na requisição: ${JSON.stringify(request)}`));
        }
      }, 10000);
    });
  }

  // --- Manipulador de mensagens ---
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('<<< Recebido:', data);

      // Resolver promessas pendentes
      if (data.req_id && this.pendingRequests.has(data.req_id)) {
        const { resolve } = this.pendingRequests.get(data.req_id);
        this.pendingRequests.delete(data.req_id);
        resolve(data);
        return;
      }

      // Processar mensagens de subscrição
      if (data.msg_type === 'balance' && data.balance) {
        this.emit('balance_update', data.balance);
      }
      
      if (data.msg_type === 'proposal_open_contract') {
        this.emit('trade_update', data.proposal_open_contract);
      }
      
      if (data.msg_type === 'transaction') {
        this.emit('transaction', data.transaction);
        if (data.transaction.action === 'sell') {
          this.emit('trade_result', data.transaction);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  }

  // --- Função para comprar contrato ---
  async buyContract(symbol, stake, duration, contractType, durationUnit = 't') {
    try {
      console.log('🛒 Executando compra:', {
        symbol,
        stake,
        duration,
        contractType,
        durationUnit
      });

      const buyRequest = {
        buy: 1,
        subscribe: 1,
        parameters: {
          amount: stake,
          contract_type: contractType,
          currency: this.currentBalance?.currency || "USD",
          duration: duration,
          duration_unit: durationUnit,
          symbol: symbol
        }
      };

      const buyResponse = await this.sendRequest(buyRequest);

      if (buyResponse.error) {
        throw new Error(`Falha na compra: ${buyResponse.error.message}`);
      }

      console.log('✅ Compra executada:', buyResponse);
      return buyResponse;

    } catch (error) {
      console.error('❌ Erro na compra:', error);
      throw error;
    }
  }
}

const derivApiManager = new DerivAPIManager();
export default derivApiManager;