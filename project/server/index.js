import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
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
    console.error('Erro durante o teste de conexão:', error);
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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});