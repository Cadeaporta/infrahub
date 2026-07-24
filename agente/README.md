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

## O que NÃO fazer
- Não commitar o `.env` em lugar nenhum (já tá no `.gitignore`).
- Não rodar em máquina que desliga à noite — perde o monitoramento justamente
  quando mais precisa (plantão).
