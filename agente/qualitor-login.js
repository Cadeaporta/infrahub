// Rodar UMA VEZ pra logar no Qualitor manualmente e salvar a sessão.
// Depois disso o print-qualitor.js reaproveita esse login sozinho.
//
// Uso: node qualitor-login.js

require("dotenv").config();
const { chromium } = require("playwright");

const QUALITOR_URL = process.env.QUALITOR_URL;

if (!QUALITOR_URL) {
  console.error("Preencha QUALITOR_URL no .env antes de rodar.");
  process.exit(1);
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(QUALITOR_URL);

  console.log("");
  console.log("Uma janela do navegador abriu. Faça login normalmente no Qualitor.");
  console.log("Depois de estar logado e ver o painel, volte aqui no terminal e");
  console.log("aperte ENTER pra salvar a sessão.");
  console.log("");

  await new Promise((resolve) => {
    process.stdin.once("data", resolve);
  });

  await context.storageState({ path: "qualitor-auth.json" });
  console.log("Sessão salva em qualitor-auth.json. Pode fechar essa janela.");

  await browser.close();
  process.exit(0);
}

main();
