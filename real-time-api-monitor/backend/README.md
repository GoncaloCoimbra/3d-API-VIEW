# 🚀 Real-Time API Health Monitor - Backend

Backend completo criado! Tudo funcional e testado.

## ⚡ Quick Start

\\\ash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor
npm run dev

# 3. Testar com endpoints de exemplo
node test-endpoints.js
\\\

## 🌐 API Endpoints

- \GET /health\ - Status do servidor
- \GET /api/endpoints\ - Listar endpoints
- \POST /api/endpoints\ - Adicionar endpoint
- \GET /api/endpoints/:id\ - Ver detalhes
- \DELETE /api/endpoints/:id\ - Remover endpoint
- \GET /api/metrics/:id\ - Métricas
- \GET /api/metrics/dashboard/stats\ - Dashboard stats

## 🔌 WebSocket

Conecta em: \ws://localhost:5000\

Eventos:
- \health_check\ - Resultado de health check
- \endpoint_added\ - Endpoint adicionado
- \endpoint_removed\ - Endpoint removido

## 🎯 Funcionalidades

✅ Health checks automáticos
✅ Real-time via WebSocket
✅ SQLite database
✅ Métricas e analytics
✅ Dashboard stats

## 🛠️ Tech Stack

- Node.js + TypeScript
- Express.js
- Socket.io
- better-sqlite3
- Axios

---

**Backend pronto! Agora é só npm install e npm run dev** 🔥
