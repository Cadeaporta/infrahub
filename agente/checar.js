// Agente de monitoramento do InfraHub
// Roda DENTRO da rede do hospital (não na Vercel), testa se os servidores
// respondem e manda o resultado pro Supabase.
//
// Uso:
//   1. npm install
//   2. Preencher o .env nessa pasta (veja .env.example)
//   3. node checar.js          -> roda um check e sai
//   4. Agendar pra rodar de tempos em tempos (Agendador de Tarefas / cron)

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const net = require("net");
const https = require("https");
const http = require("http");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const AGENTE_EMAIL = process.env.AGENTE_EMAIL;
const AGENTE_SENHA = process.env.AGENTE_SENHA;
const TIMEOUT_MS = 5000;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !AGENTE_EMAIL || !AGENTE_SENHA) {
  console.error("Faltou preencher o .env. Veja o .env.example.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function checarTcp(host, porta) {
  return new Promise((resolve) => {
    const inicio = Date.now();
    const socket = new net.Socket();
    let resolvido = false;

    socket.setTimeout(TIMEOUT_MS);

    socket.on("connect", () => {
      resolvido = true;
      socket.destroy();
      resolve({ online: true, tempoMs: Date.now() - inicio, sslDias: null });
    });

    socket.on("timeout", () => {
      if (!resolvido) {
        resolvido = true;
        socket.destroy();
        resolve({ online: false, tempoMs: null, sslDias: null });
      }
    });

    socket.on("error", () => {
      if (!resolvido) {
        resolvido = true;
        resolve({ online: false, tempoMs: null, sslDias: null });
      }
    });

    socket.connect(porta, host);
  });
}

function checarHttp(urlStr) {
  return new Promise((resolve) => {
    const inicio = Date.now();
    let url;
    try {
      url = new URL(urlStr);
    } catch {
      resolve({ online: false, tempoMs: null, sslDias: null });
      return;
    }

    const lib = url.protocol === "https:" ? https : http;

    const req = lib.get(
      url,
      { timeout: TIMEOUT_MS, rejectUnauthorized: false },
      (res) => {
        const tempoMs = Date.now() - inicio;
        let sslDias = null;

        if (url.protocol === "https:" && res.socket && res.socket.getPeerCertificate) {
          const cert = res.socket.getPeerCertificate();
          if (cert && cert.valid_to) {
            const validoAte = new Date(cert.valid_to);
            sslDias = Math.round((validoAte.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          }
        }

        const online = res.statusCode >= 200 && res.statusCode < 400;
        res.resume();
        resolve({ online, tempoMs, sslDias });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      resolve({ online: false, tempoMs: null, sslDias: null });
    });

    req.on("error", () => {
      resolve({ online: false, tempoMs: null, sslDias: null });
    });
  });
}

async function main() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: AGENTE_EMAIL,
    password: AGENTE_SENHA,
  });

  if (authError) {
    console.error("Falha no login do agente:", authError.message);
    process.exit(1);
  }

  const { data: servidores, error: erroServidores } = await supabase
    .from("servidores")
    .select("*");

  if (erroServidores) {
    console.error("Erro ao buscar servidores:", erroServidores.message);
    process.exit(1);
  }

  for (const s of servidores ?? []) {
    let resultado;

    if (s.tipo === "http") {
      resultado = await checarHttp(s.url ?? `http://${s.host}`);
    } else {
      resultado = await checarTcp(s.host, s.porta ?? 80);
    }

    await supabase.from("checks_servidor").insert({
      servidor_id: s.id,
      online: resultado.online,
      tempo_resposta_ms: resultado.tempoMs,
      ssl_dias_restantes: resultado.sslDias,
    });

    console.log(
      `${s.nome}: ${resultado.online ? "online" : "offline"}` +
        (resultado.tempoMs ? ` (${resultado.tempoMs}ms)` : "")
    );
  }

  process.exit(0);
}

main();
