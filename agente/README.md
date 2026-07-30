# Agente de monitoramento InfraHub

Roda dentro da rede do hospital (não na Vercel) e reporta pro Supabase se os
servidores cadastrados em **Servidores** (dentro do site) estão respondendo.

## Passo a passo (na máquina que fica sempre ligada)

1. Instalar o [Node.js](https://nodejs.org) (versão 18 ou mais nova).

2. Copiar essa pasta `agente/` inteira pra máquina.

3. Abrir um terminal dentro da pasta e rodar:
   ```
   npm install
   ```

4. Copiar `.env.example` pra `.env` e preencher a senha do agente:
   ```
   copy .env.example .env
   ```
   (no Windows) ou `cp .env.example .env` (Linux/Mac).

5. Testar rodando uma vez:
   ```
   node checar.js
   ```
   Deve aparecer uma linha por servidor: `AD: online (12ms)`.

## Conta do agente

O login `agente.monitoramento@bragait.com` precisa existir no InfraHub antes de
rodar o script (crie normalmente pela tela de login do site, com uma senha
forte — essa senha é a que vai no `.env`). Depois de criar, me avisa que eu
libero/confirmo a conta no banco.

## Agendar pra rodar sozinho

### Windows (Agendador de Tarefas)
1. Abrir "Agendador de Tarefas".
2. Criar Tarefa Básica → Disparar "Diariamente" → repetir a cada 5 minutos.
3. Ação: iniciar programa → `node.exe` → Argumentos: caminho completo pro
   `checar.js` (ex: `C:\infrahub-agente\checar.js`).

### Linux/Mac (cron)
```
*/5 * * * * cd /caminho/para/agente && node checar.js >> log.txt 2>&1
```

## Print automático do Qualitor (opcional)

Isso tira um print de uma parte do Qualitor de tempos em tempos e salva como
imagem, pra usar na tela `infrahub-tv-plantao.html` sem precisar de login
embutido em nenhum lugar.

1. Instalar o navegador do Playwright (só na primeira vez):
   ```
   npx playwright install chromium
   ```

2. Preencher no `.env`:
   ```
   QUALITOR_URL=https://qualitor.suaempresa.com.br/dashboard
   QUALITOR_SELECTOR=   (opcional, veja abaixo)
   SAIDA_PRINT=         (opcional, por padrão salva print.png nessa pasta)
   ```

3. Logar uma vez (abre uma janela de verdade pra você digitar usuário/senha):
   ```
   node qualitor-login.js
   ```
   Loga normalmente, volta no terminal e aperta ENTER. Isso salva um arquivo
   `qualitor-auth.json` — é a sessão logada, guarda esse arquivo com cuidado
   (já tá no `.gitignore`, nunca sobe pro GitHub).

4. Testar o print:
   ```
   node print-qualitor.js
   ```
   Sem `QUALITOR_SELECTOR` preenchido, ele tira print da página inteira.
   Pra recortar só um card específico (tipo aquele "Minha equipe"), abra o
   Qualitor no Chrome, clique com botão direito em cima do card → Inspecionar
   → copia o seletor CSS do elemento (botão direito no HTML destacado →
   Copy → Copy selector) e cola em `QUALITOR_SELECTOR`.

5. **Colocar `print.png` na MESMA pasta do `infrahub-tv-plantao.html`** — é
   assim que a tela acha o arquivo. No painel da TV, clica em "⚙ Arquivo" e
   confirma que o nome bate (`print.png` por padrão).

6. Agendar `node print-qualitor.js` pra rodar a cada 5-10 minutos (mesma
   lógica do Agendador de Tarefas usada pro `checar.js`).

A sessão salva pode expirar de tempos em tempos (depende de como o Qualitor
configura o tempo de login) — se o print parar de atualizar, rode o
`qualitor-login.js` de novo.

## O que NÃO fazer
- Não commitar o `.env` em lugar nenhum (já tá no `.gitignore`).
- Não rodar em máquina que desliga à noite — perde o monitoramento justamente
  quando mais precisa (plantão).
