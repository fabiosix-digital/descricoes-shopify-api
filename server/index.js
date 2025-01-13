import express from 'express';
import axios from 'axios';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
config();

// Configurações do servidor
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

console.log(`[${new Date().toISOString()}] Iniciando servidor...`);
console.log(`[${new Date().toISOString()}] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[${new Date().toISOString()}] HOST: ${HOST}`);
console.log(`[${new Date().toISOString()}] PORT: ${PORT}`);

// Configurar caminho do dist
const distPath = resolve(__dirname, isProduction ? './dist' : '../dist');
console.log(`[${new Date().toISOString()}] Verificando pasta dist: ${distPath}`);

// Servir arquivos estáticos do frontend com path absoluto
app.use(express.static(distPath));

// Configurar CORS para aceitar requisições do Netlify e localhost
app.use(cors({
  origin: [
    'https://cheery-belekoy-36990a.netlify.app',
    'https://*.onrender.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'API está online!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

app.post('/api/test-shopify-connection', async (req, res) => {
  const { apiKey, apiSecret, shopDomain, accessToken } = req.body;

  if (!apiKey || !apiSecret || !shopDomain || !accessToken) {
    return res.status(400).json({
      success: false,
      error: 'Todos os campos são obrigatórios'
    });
  }

  try {
    const cleanDomain = shopDomain.includes('.myshopify.com') 
      ? shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
      : `${shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}.myshopify.com`;
    
    const url = `https://${cleanDomain}/admin/api/2023-01/shop.json`;
    
    const shopifyResponse = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken.trim(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Shopify App'
      }
    });

    if (shopifyResponse.data && shopifyResponse.data.shop) {
      return res.json({ 
        success: true,
        shop: shopifyResponse.data.shop
      });
    } else {
      throw new Error('Resposta da Shopify não contém dados da loja');
    }
  } catch (error) {
    console.error('Erro na conexão:', error.message);
    let errorMessage = 'Erro de conexão desconhecido';

    if (error.message?.includes('401')) {
      errorMessage = 'Token de acesso inválido';
    } else if (error.message?.includes('404')) {
      errorMessage = 'Domínio da loja inválido';
    } else if (error.message?.includes('403')) {
      errorMessage = 'Sem permissão para acessar a loja';
    }

    return res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.post('/api/generate-description', async (req, res) => {
  try {
    return res.status(500).json({ 
      error: 'OpenAI não configurado. Configure OPENAI_API_KEY nas variáveis de ambiente.' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para servir o frontend - deve ser a última rota
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  console.log('Servindo arquivo:', indexPath);
  res.sendFile(indexPath);
});

app.listen(PORT, HOST, () => {
  console.log(`[${new Date().toISOString()}] Servidor iniciado em ${HOST}:${PORT}`);
  console.log(`[${new Date().toISOString()}] Ambiente: ${process.env.NODE_ENV}`);
  console.log(`[${new Date().toISOString()}] Diretório base: ${__dirname}`);
  console.log(`[${new Date().toISOString()}] Caminho do index.html: ${join(distPath, 'index.html')}`);
});