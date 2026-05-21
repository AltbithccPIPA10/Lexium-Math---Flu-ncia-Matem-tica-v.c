# LExium Math - Diretrizes Críticas de Operação e Formato

Este documento estabelece regras permanentes e obrigatórias para o funcionamento do motor de inteligência e aferição do LExium Math. Nenhuma futura alteração no código ou novas implementações (mesmo de interface, cabeçalhos ou rodapés) deve corromper este padrão.

---

## 🔒 1. Princípio da Desconexão de Dados (Cego por Design)
*   **O modelo de IA (Gemini) deve operar cego à operação matemática exposta**.
*   **Finalidade**: Garantir a estrita audição fônica sem que o modelo invente ou "corrija" o valor para bater com o gabarito real da tela (alucinação autocomplacente).

---

## 🎙️ 2. Instruções do Motor de Transcrição Fonética
O prompt de sistema configurado no backend (`server.ts`) deve atuar estritamente como um **conversor de áudio para algarismo numérico plano**:

```text
Você é o motor de transcrição fonética puramente numérica do LExium Math. Sua única e absoluta função é ouvir o áudio gravado e extrair o número falado pelo usuário.

Regras de Operação Estritas:
1. Você NÃO tem acesso à operação matemática da tela e NÃO sabe o gabarito. Não tente adivinhar ou corrigir o usuário.
2. Identifique o último número falado de forma clara. 
   - Se o usuário disser "cinco", retorne estritamente: 5
   - Se o usuário disser "dezesseis", retorne estritamente: 16
   - Se o usuário disser "vinte e um", retorne estritamente: 21
3. Se houver apenas ruído de fundo, silêncio ou se nenhuma palavra numérica for identificada, retorne estritamente: null
4. Sua saída deve conter APENAS o número puro ou null. Não inclua pontos finais, saudações ou explicações.
```

---

## 🖥️ 3. Validação Aritmética Local (JavaScript)
Qualquer julgamento de acerto ("ACERTO") ou erro ("ERRO") de fluência cognitiva **DEVE** ocorrer exclusivamente do lado do cliente via JavaScript.
*   **Fluxo**:
    1. O áudio do aluno é capturado e enviado para o backend.
    2. O backend retorna **unicamente** o número transcrito puro (ex: `"16"` ou `"null"`).
    3. O código do React executa a conferência exata de forma determinística:
       ```javascript
       const eCorreto = Number(numeroTranscrito) === operacaoAtual.gabaritoEsperado;
       const status = eCorreto ? "ACERTO" : "ERRO";
       ```
    4. O resultado é armazenado no estado em `resultadoItem` e disponibilizado na interface de "Auditoria do Item" com total transparência para o instrutor/aplicador.

---

## 🎨 4. Customização de Cabeçalho e Rodapé
A interface permite a total customização e salvamento automático do Título, Subtítulo e Rodapé no `localStorage` do navegador sob o painel de **Branding e Identidade**. As futuras alterações devem respeitar a leitura destas chaves:
*   `lexium_header_title`
*   `lexium_subtitle`
*   `lexium_footer_text`
