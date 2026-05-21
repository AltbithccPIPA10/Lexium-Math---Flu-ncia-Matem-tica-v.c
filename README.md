<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# LExium Math - Sistema de Aferição Auditiva Inteligente

Plataforma de avaliação matemática com reconhecimento de áudio por IA, usando Google Gemini.

## 🚀 Deploy Rápido na Vercel

**⚠️ Erros de áudio no deploy?** Siga o [QUICKSTART.md](./QUICKSTART.md) (5 minutos)

### Passos Essenciais:
1. Gere chave em [aistudio.google.com/app/apikeys](https://aistudio.google.com/app/apikeys)
2. Deploy em [vercel.com](https://vercel.com)
3. Adicione `GEMINI_API_KEY` em **Environment Variables**
4. Clique **Redeploy**

**Documentação Completa**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🆘 Problemas?

- **"Erro ao processar áudio"?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Quer diagnosticar?** → Abra `/api/debug` no navegador após deploy
- **Desenvolvimento local?** → Veja "Executar Localmente" abaixo

## ✨ Funcionalidades

- ✅ Reconhecimento de fala em português (Brasil)
- ✅ Transcrição de números via IA Gemini
- ✅ Validação automática de respostas
- ✅ Histórico de tentativas com análise de fluência
- ✅ Interface responsiva (mobile/desktop)
- ✅ Fallback para transcrição do navegador (sem internet)

## 🖥️ Executar Localmente

**Pré-requisitos:**
- Node.js 18+
- Chave Gemini API

**Passos:**

```bash
# 1. Clonar/abrir o projeto
cd lexium-math

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env.local
# Edite .env.local e adicione: GEMINI_API_KEY=sua_chave

# 4. Executar em desenvolvimento
npm run dev

# A aplicação abrirá em http://localhost:3000
```

## 🏗️ Arquitetura

```
Backend (Express + Node.js)
├── /api/evaluate-math-audio   [POST] Processa áudio via Gemini
├── /api/config-status         [GET]  Status da API Gemini
└── /api/debug                 [GET]  Diagnóstico do sistema

Frontend (React + Vite)
├── VoiceTestingBench          [Componente principal]
├── Recording / Playback       [Captura de áudio]
└── Resultado / Auditoria      [Visualização de resultados]
```

## 📋 Variáveis de Ambiente

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `GEMINI_API_KEY` | ✅ SIM | - | Chave da API Gemini (obtenha em aistudio.google.com) |
| `APP_URL` | ❌ Não | http://localhost:3000 | URL da aplicação (set by Vercel) |
| `NODE_ENV` | ❌ Não | development | Ambiente: development/production |
| `PORT` | ❌ Não | 3000 | Porta do servidor |

## 🔑 Como Obter GEMINI_API_KEY

1. Acesse [aistudio.google.com/app/apikeys](https://aistudio.google.com/app/apikeys)
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Selecione/crie um projeto
5. **Copie a chave completa** (começa com `sk-proj-...`)
6. ⚠️ **Nunca compartilhe essa chave!**

## 🧪 Testar Deploy

Após fazer deploy na Vercel:

```bash
# Ver status da configuração
curl https://seu-projeto.vercel.app/api/config-status

# Ver diagnóstico completo
curl https://seu-projeto.vercel.app/api/debug
```

Resposta esperada:
```json
{
  "geminiApiKeyConfigured": true,
  "appUrl": "https://seu-projeto.vercel.app"
}
```

## 📊 Scripts Disponíveis

```bash
npm run dev      # Executar em desenvolvimento (hot reload)
npm run build    # Build para produção
npm run start    # Executar build produção localmente
npm run lint     # Verificar tipos TypeScript
npm run clean    # Limpar dist/ e builds anteriores
```

## 🛠️ Tecnologias

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js, Google Gemini API
- **Deploy**: Vercel (Serverless)
- **Reconhecimento de Fala**: Web Speech API + Google Gemini

## 📚 Documentação Adicional

- [QUICKSTART.md](./QUICKSTART.md) - Deploy rápido (5 minutos)
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guia detalhado de deploy
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solução de problemas
- [AGENTS.md](./AGENTS.md) - Especificações do motor de processamento

## 🐛 Reporting Issues

Se encontrar bugs:

1. Abra [/api/debug](https://seu-projeto.vercel.app/api/debug) para diagnóstico
2. Verifique os logs em Vercel → Deployments → Functions
3. Consulte [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📜 Licença

Ver repositório de origem em AI Studio

## 🎯 Status do Sistema

| Componente | Status |
|-----------|--------|
| Transcrição de Áudio | ✅ Ativo |
| Gemini API | ✅ Integrado |
| Deploy Vercel | ✅ Testado |
| Fallback Navegador | ✅ Disponível |
