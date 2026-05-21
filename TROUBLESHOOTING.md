# 🔧 Troubleshooting - Erros de Processamento de Áudio

## ❌ "Houve um erro de processamento do áudio no servidor LExium"

Este é o erro mais comum quando a chave Gemini não está configurada. Siga os passos abaixo:

---

## 🚨 Problema 1: GEMINI_API_KEY não configurada

### Sintomas:
- ❌ Erro genérico ao analisar áudio
- ⚠️ Status mostra "Modo Simulado" em vez de "Gemini Ativo"
- O sistema cai para fallback de navegador

### Solução:

#### Na Vercel:
1. Vá para seu projeto → **Settings**
2. Clique em **Environment Variables**
3. Clique em **Add**
4. Preencha:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: [Cole sua chave Gemini]
   - **Environments**: Selecione Production, Preview, Development
5. Clique em **Add**
6. Volte a **Deployments** e clique em **Redeploy**

#### Localmente:
1. Copie `.env.example` para `.env.local`
2. Adicione: `GEMINI_API_KEY=sua_chave_aqui`
3. Restart o servidor: `npm run dev`

---

## 🚨 Problema 2: Chave Gemini inválida ou expirada

### Sintomas:
- ❌ Erro `401 Unauthenticated`
- Logs mostram: "GEMINI_API_KEY is not configured"

### Solução:

1. Gere uma **nova chave** em [aistudio.google.com/app/apikeys](https://aistudio.google.com/app/apikeys)
2. Atualize a variável na Vercel (copie a chave inteira)
3. **Redeploy** o projeto
4. Teste novamente

---

## 🚨 Problema 3: Modelo Gemini desatualizado

### Sintomas (JÁ CORRIGIDO):
- ❌ Erro 404 ou 400 relacionado a modelo
- Logs mostram `gemini-3.5-flash` (modelo inválido)

### ✅ Já Corrigido:
O arquivo foi atualizado para usar `gemini-2.0-flash` ✓

---

## 🚨 Problema 4: Limite de requisições atingido (429)

### Sintomas:
- ❌ Erro `429 Resource Exhausted`
- Sistema estava funcionando, mas parou de repente

### Solução:

1. **Aguarde 24 horas** (limite diário)
2. OU **Upgrade seu plano** em [ai.google.dev](https://ai.google.dev)
3. Teste com menos áudios por hora

---

## 🚨 Problema 5: Áudio muito grande

### Sintomas:
- ❌ Erro "Arquivo de áudio muito grande"
- Audio gravado > 20MB

### Solução:

1. Reduza a duração da gravação
2. Use áudio em qualidade mono (não estéreo)
3. Máximo ~30 segundos de áudio

---

## 📊 Como Debugar

### Ver logs em tempo real:

#### Na Vercel:
1. Painel do projeto → **Deployments**
2. Clique no deployment mais recente
3. Clique em **Functions**
4. Selecione `/api/evaluate-math-audio`
5. **Veja logs em tempo real**

#### Localmente:
```bash
npm run dev
# Logs aparecem no terminal
```

### Acessar endpoint de diagnóstico:

Abra no navegador:
```
https://seu-projeto.vercel.app/api/debug
```

Você verá:
```json
{
  "status": "LExium Math - Diagnostic Report",
  "gemini": {
    "apiKey": {
      "exists": true/false,
      "isValid": true/false
    },
    "status": "✅ Ready" ou "❌ Not configured"
  },
  "hints": [...]
}
```

---

## 🧪 Teste Passo a Passo

1. ✅ Abra [seu-projeto.vercel.app](https://seu-projeto.vercel.app)
2. ✅ Veja o status: **"Gemini Ativo"** (verde) ou **"Modo Simulado"** (amarelo)?
   - Se Modo Simulado → GEMINI_API_KEY não configurada
3. ✅ Configure uma operação (ex: 5 + 4)
4. ✅ Clique no microfone (botão redondo azul)
5. ✅ Fale claramente um número (ex: "Nove!")
6. ✅ Após parar, clique em **"Analisar IA"**
7. ✅ Veja o resultado

### Se falhar em qualquer ponto:
- Abra Developer Tools (F12)
- Vá para **Console**
- Procure por mensagens de erro
- Copie os erros e confira neste guia

---

## 📞 Checklist Final

Antes de fazer deploy na Vercel:

- [ ] Chave Gemini foi gerada em [aistudio.google.com/app/apikeys](https://aistudio.google.com/app/apikeys)
- [ ] Chave foi adicionada em **Vercel Settings > Environment Variables**
- [ ] Projeto foi feito **Redeploy** após adicionar a chave
- [ ] URL do projeto abre corretamente
- [ ] Status mostra **"Gemini Ativo"** (não "Modo Simulado")
- [ ] Teste de áudio funcionou com sucesso

---

## 🆘 Ainda não funciona?

1. Copie o erro do **Console** (F12)
2. Copie os **logs da Vercel** (`/api/debug`)
3. Verifique se a chave tem permissões para:
   - Audio processing
   - Vision API
   - Generative AI

4. **Contate suporte Google Gemini**: [support.google.com](https://support.google.com)
