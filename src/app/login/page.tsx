"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Email ou senha incorretos.");
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex-1 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-panel scanline pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent status-pulse" />
            <span className="font-mono text-xs tracking-[0.3em] text-text-dim uppercase">
              Multi360 · NOC
            </span>
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-tight">InfraHub</h1>
          <p className="text-text-dim text-sm mt-1">One place for everything IT.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-panel-2 border border-line rounded-lg p-6 space-y-4"
        >
          <div className="flex gap-1 bg-bg rounded-md p-1 mb-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 text-sm rounded font-mono transition-colors ${
                mode === "login" ? "bg-accent text-bg" : "text-text-dim"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-1.5 text-sm rounded font-mono transition-colors ${
                mode === "signup" ? "bg-accent text-bg" : "text-text-dim"
              }`}
            >
              Criar conta
            </button>
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs text-text-dim mb-1 font-mono">Nome</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-bg border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
                placeholder="Guilherme Alves"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-text-dim mb-1 font-mono">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="voce@multi360.com"
            />
          </div>

          <div>
            <label className="block text-xs text-text-dim mb-1 font-mono">Senha</label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-danger text-sm font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-bg font-semibold rounded py-2 text-sm hover:bg-accent-dim transition-colors disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </main>
  );
}
