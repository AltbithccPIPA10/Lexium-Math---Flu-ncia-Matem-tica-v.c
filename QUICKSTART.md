# ⚡ Quick Start - LExium Math na Vercel

## 🚀 Siga ESTES 5 passos (5 minutos):

### 1️⃣ Obter Chave Gemini
```
https://aistudio.google.com/app/apikeys → Create API Key → Copiar
```

### 2️⃣ Ir para Vercel
```
https://vercel.com/dashboard → Add New → Project
```

### 3️⃣ Importar Projeto
- Selecione seu repositório GitHub com o código LExium Math
- Clique **Import**

### 4️⃣ Adicionar Variável de Ambiente
Na tela de configuração:
- **Name**: `GEMINI_API_KEY`
- **Value**: [Cole sua chave Gemini]
- Clique **Add**

### 5️⃣ Deploy
- Clique **Deploy**
- Aguarde ~3 minutos
- Clique na URL gerada para testar

---

## ✅ Teste Rápido

1. Abra sua URL (ex: `seu-projeto.vercel.app`)
2. Veja o indicador de status (deve estar **"Gemini Ativo"** em verde)
3. Configure: `5 + 4`
4. Clique no microfone 🎤
5. Fale: **"Nove"**
6. Clique **Analisar IA** ✨

---

## ❌ Se der erro:

### Erro de Áudio?
```
1. Vercel Dashboard → Settings → Environment Variables
2. Verifique se GEMINI_API_KEY está lá
3. Se não estiver, adicione (copie a chave INTEIRA)
4. Clique Redeploy
5. Aguarde 2 minutos
6. Teste novamente
```

### Dúvida sobre a Chave?
```
https://aistudio.google.com/app/apikeys
(A chave começa com: sk-proj-...)
```

---

## 📚 Documentação Completa

- **Deploy Detalhado**: Veja `DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: Veja `TROUBLESHOOTING.md`
- **Diagnóstico**: Abra `/api/debug` no navegador

---

## 🎯 Status do Deploy

| Indicador | Significado |
|-----------|------------|
| 🟢 Gemini Ativo | API Gemini configurada ✅ |
| 🟡 Modo Simulado | API não configurada ⚠️ (funciona com fallback) |
| 🔴 Erro | Problema na API |

---

**Pronto?** Vá para [vercel.com](https://vercel.com) agora! 🚀
