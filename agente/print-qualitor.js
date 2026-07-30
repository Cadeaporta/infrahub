// Roda de tempos em tempos (Agendador de Tarefas / cron) e salva um print
// só da parte do Qualitor que interessa, reaproveitando o login salvo em
// qualitor-auth.json (gerado pelo qualitor-login.js).
//
// Uso: node print-qualitor.js

require("dotenv").config();
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const QUALITOR_URL = process.env.QUALITOR_URL;
const QUALITOR_SELECTOR = process.env.QUALITOR_SELECTOR || null;
const SAIDA = process.env.SAIDA_PRINT || path.join(__dirname, "print.png");

if (!QUALITOR_URL) {
  console.error("Preencha QUALITOR_URL no .env.");
  process.exit(1);
}

if (!fs.existsSync(path.join(__dirname, "qualitor-auth.json"))) {
  console.error("Não achei qualitor-auth.json. Rode 'node qualitor-login.js' primeiro.");
  process.exit(1);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: path.join(__dirname, "qualitor-auth.json"),
    viewport: { width: 1400, height: 900 },
  });
  const page = await context.newPage();

  await page.goto(QUALITOR_URL, { waitUntil: "networkidle" });

  if (QUALITOR_SELECTOR) {
    try {
      const elemento = await page.waitForSelector(QUALITOR_SELECTOR, { timeout: 10000 });
      await elemento.screenshot({ path: SAIDA });
      console.log(`Print do elemento "${QUALITOR_SELECTOR}" salvo em ${SAIDA}`);
    } catch (e) {
      console.error(`Não achei o elemento "${QUALITOR_SELECTOR}", tirando print da página inteira.`);
      await page.screenshot({ path: SAIDA });
    }
  } else {
    await page.screenshot({ path: SAIDA });
    console.log(`Print da página inteira salvo em ${SAIDA}`);
  }

  await browser.close();
  process.exit(0);
}

main().catch((e) => {
  console.error("Erro ao tirar o print:", e.message);
  process.exit(1);
});
