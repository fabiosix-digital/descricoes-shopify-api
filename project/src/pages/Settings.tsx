import React from 'react';
import { Save, Link, UnplugIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function Settings() {
  const [shopifyStatus, setShopifyStatus] = useState<{
    connected: boolean;
    message: string;
    error?: string;
  }>({ connected: false, message: '' });

  const [credentials, setCredentials] = useState({
    apiKey: '69aa28041fb3b759cf75874faa4fe878',
    apiSecret: 'af540bfe39338f2e005a333dbe190897',
    shopDomain: 'hbs79y-kd.myshopify.com',
    accessToken: 'shpat_XXXXXXXXXX'
  });

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10; // Número máximo de tentativas
  const retryDelay = 3000; // 3 segundos entre tentativas

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const testConnection = async () => {
    console.log('[Shopify] Iniciando teste de conexão');
    
    setShopifyStatus({
      connected: false,
      message: 'Conectando com a Shopify...',
      error: undefined
    });

    const trimmedCredentials = {
      apiKey: credentials.apiKey.trim(),
      apiSecret: credentials.apiSecret.trim(),
      shopDomain: credentials.shopDomain.trim(),
      accessToken: credentials.accessToken.trim()
    };

    if (!trimmedCredentials.apiKey || !trimmedCredentials.apiSecret || 
        !trimmedCredentials.shopDomain || !trimmedCredentials.accessToken) {
      setShopifyStatus({
        connected: false,
        message: 'Falha na conexão',
        error: 'Todos os campos são obrigatórios'
      });
      return;
    }

    try {
      const formattedDomain = trimmedCredentials.shopDomain.includes('.myshopify.com')
        ? trimmedCredentials.shopDomain
        : `${trimmedCredentials.shopDomain}.myshopify.com`;

      const response = await fetch('/api/test-shopify-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...trimmedCredentials,
          shopDomain: formattedDomain
        })
      }).catch(error => {
        throw new Error(`Erro de conexão com o servidor: ${error.message}`);
      });

      // Log da resposta para debug
      console.log('[Shopify] Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Erro ${response.status} ao conectar com a Shopify`
        );
      }

      const data = await response.json();
      console.log('[Shopify] Resposta recebida:', data);

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido ao conectar com a Shopify');
      }
      
      setShopifyStatus({
        connected: true,
        message: `Conexão estabelecida com sucesso! Loja: ${
          data.shop?.name || 
          data.shop?.myshopify_domain ||
          trimmedCredentials.shopDomain
        }`,
        error: undefined
      });
    } catch (error) {
      console.error('[Shopify] Erro durante o teste de conexão:', error);
      
      let errorMessage = error.message || 'Erro desconhecido';
      
      if (error.message?.includes('401')) {
        errorMessage = 'Token de acesso inválido ou expirado. Verifique suas credenciais.';
      } else if (error.message?.includes('404')) {
        errorMessage = 'Domínio da loja não encontrado. Verifique se o domínio está correto.';
      } else if (error.message?.includes('402') || error.message?.includes('403')) {
        errorMessage = 'Sem permissão para acessar a loja. Verifique as permissões do app.';
      } else if (error.message?.toLowerCase().includes('conexão')) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua conexão com a internet.';
      } else if (error.message?.toLowerCase().includes('invalid')) {
        errorMessage = 'Resposta inválida do servidor. Tente novamente em alguns minutos.';
      } else if (error.message?.includes('SyntaxError')) {
        errorMessage = 'Erro ao processar resposta do servidor. Tente novamente.';
      } else if (error.message?.includes('dados esperados')) {
        errorMessage = 'A resposta da Shopify não contém os dados necessários';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Tempo limite excedido. Tente novamente.';
      } else if (error.message?.includes('ECONNREFUSED')) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando.';
      }
      
      setShopifyStatus({
        connected: false,
        message: 'Erro ao testar conexão',
        error: errorMessage
      });
    } finally {
      setIsRetrying(false);
      setRetryCount(0);
    }
  };

  const startRetrying = () => {
    setIsRetrying(true);
    setRetryCount(0);
    testConnection();
  };

  const disconnectShopify = () => {
    setIsRetrying(false);
    setRetryCount(0);
    setCredentials({
      apiKey: '',
      apiSecret: '',
      shopDomain: '',
      accessToken: ''
    });
    setShopifyStatus({
      connected: false,
      message: 'Desconectado com sucesso'
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>

      <div className="mt-6 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Configuração da Shopify</h2>
          
          {/* Status da Conexão */}
          {shopifyStatus.message && (
            <div className={`mt-4 p-4 rounded-md ${
              shopifyStatus.connected ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex">
                {shopifyStatus.connected ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
                <div className="ml-3">
                  <p className={`text-sm ${
                    shopifyStatus.connected ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {shopifyStatus.message}
                  </p>
                  {shopifyStatus.error && (
                    <p className="mt-1 text-sm text-red-600">
                      Motivo: {shopifyStatus.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chave da API
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Exemplo: 69aa28041fb3b759cf75874faa4fe878"
                value={credentials.apiKey}
                onChange={(e) => setCredentials({
                  ...credentials,
                  apiKey: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chave Secreta da API
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Exemplo: af540bfe39338f2e005a333dbe190897"
                value={credentials.apiSecret}
                onChange={(e) => setCredentials({
                  ...credentials,
                  apiSecret: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Domínio da Loja
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Exemplo: loja.myshopify.com"
                value={credentials.shopDomain}
                onChange={(e) => setCredentials({
                  ...credentials,
                  shopDomain: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Token de Acesso
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Exemplo: shpat_XXXXXXXXXX"
                value={credentials.accessToken}
                onChange={(e) => setCredentials({
                  ...credentials,
                  accessToken: e.target.value
                })}
              />
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={isRetrying ? disconnectShopify : startRetrying}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Link className="h-5 w-5 mr-2" />
              {isRetrying ? 'Cancelar Tentativas' : 'Testar Conexão'}
            </button>
            <button
              onClick={disconnectShopify}
              disabled={isRetrying}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                isRetrying 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <UnplugIcon className="h-5 w-5 mr-2" />
              Desconectar
            </button>
          </div>

          {/* Instruções */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Como obter suas credenciais Shopify
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900">1. Acesse o Painel Shopify</h4>
                <p>Entre no painel administrativo da sua loja Shopify.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">2. Crie um App Privado</h4>
                <p>Vá em Configurações → Apps e canais → Desenvolver apps → Criar app</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">3. Configure as Permissões</h4>
                <p>Em "Configuração da API", selecione as permissões de produtos (read_products, write_products)</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">4. Obtenha as Credenciais</h4>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>A Chave da API e Chave Secreta estarão na página do app</li>
                  <li>O Token de Acesso é gerado após configurar as permissões</li>
                  <li>O Domínio da Loja é seu domínio .myshopify.com</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}