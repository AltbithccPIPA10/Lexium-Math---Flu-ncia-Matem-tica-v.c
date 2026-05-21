# 🚀 Guia de Deploy LExium Math na Vercel

## ⚠️ Problemas Comuns Resolvidos

Este guia resolve os erros mais comuns ao fazer deploy:
- ❌ Modelo Gemini desatualizado (`gemini-3.5-flash` não existe)
- ❌ `GEMINI_API_KEY` não configurada
- ❌ Erro "Houve um erro de processamento do áudio no servidor LExium"

---

## 📋 Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Chave Gemini API**: [aistudio.google.com/app/apikeys](https://aistudio.google.com/app/apikeys)
3. **Repositório Git** (GitHub, GitLab ou similar)

---

## 🔑 Passo 1: Obter Chave da API Gemini

1. Acesse [aistudio.google.com/app/apikeys](https://aistudio.google.com/app/apikeys)
2. Clique em **"Create API Key"**
3. Selecione/crie um projeto (ex: "lexium-math")
4. Copie a chave gerada (salve em local seguro!)
5. ⚠️ **Nunca compartilhe esta chave publicamente**

---

## 📤 Passo 2: Fazer Upload do Código

### Via GitHub (Recomendado)

```bash
# Clone ou crie o repositório
git init
git add .
git commit -m "LExium Math - Deploy inicial"
git remote add origin https://github.com/seu-usuario/lexium-math.git
git push -u origin main
```

---

## 🌐 Passo 3: Criar Projeto na Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione seu repositório GitHub
4. Clique em **"Import"**

---

## 🔐 Passo 4: Configurar Environment Variables

**CRÍTICO**: A API Gemini precisa ser configurada!

1. Na tela de importação da Vercel, você verá uma seção de variáveis
2. Procure por **"Environment Variables"**
3. Adicione as seguintes variáveis:

| Nome | Valor | Obrigatório |
|------|-------|-------------|
| `GEMINI_API_KEY` | [Sua chave Gemini] | ✅ SIM |
| `APP_URL` | Deixe em branco (auto) | ❌ Não |
| `NODE_ENV` | `production` | ❌ Não |

**Exemplo:**
```
GEMINI_API_KEY = sk-proj-abc123def456...
```

4. Clique em **"Deploy"**

---

## ✅ Passo 5: Verificar Deploy

Após ~2-3 minutos:

1. ✅ Vercel mostrará uma URL (ex: `https://seu-projeto.vercel.app`)
2. Abra a URL no navegador
3. Teste a funcionalidade de áudio:
   - Configure uma operação (ex: 5 + 4)
   - Clique no microfone
   - Fale um número (ex: "Nove!")
   - Clique em "Analisar IA"

### Se receber erro de áudio:

```
❌ "Ocorreu um erro ao avaliar o áudio do aluno"
```

**Solução:**
1. Volte ao painel Vercel
2. Vá para **Settings** → **Environment Variables**
3. Verifique se `GEMINI_API_KEY` está lá
4. Se não, adicione-a
5. Clique em **Redeploy** (3 pontos → Redeploy)

---

## 🔍 Diagnosticar Erros

### Ver Logs no Vercel

1. Na página do projeto, clique em **"Deployments"**
2. Clique no deploy mais recente
3. Clique em **"Functions"** (abaixo)
4. Selecione `/api/evaluate-math-audio`
5. **Ver logs** mostram erros em tempo real

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `GEMINI_API_KEY is not configured` | Variável não definida | Adicione em Environment Variables |
| `401 Unauthenticated` | Chave inválida/expirada | Gere nova chave em aistudio.google.com |
| `429 Resource Exhausted` | Limite da API atingido | Aguarde 24h ou upgrade plano |
| `Audio too large` | Arquivo > 20MB | Use áudio de menor duração |

---

## 🛠️ Redeploy Após Mudanças

Se fizer mudanças no código:

```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

Vercel fará deploy automaticamente! ✨

---

## 📧 Suporte

Se ainda tiver problemas:

1. Verifique logs em `vercel.com/dashboard`
2. Confirme que `GEMINI_API_KEY` é uma chave válida
3. Tente fazer um novo deploy via Dashboard (redeploy)
4. Verifique conexão de internet no dispositivo testando o áudio

---

## 📚 Referências

- Documentação Vercel: https://vercel.com/docs
- Documentação Google Gemini: https://ai.google.dev/
- Status API Gemini: https://status.cloud.google.com
