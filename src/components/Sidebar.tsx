"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Package,
  Monitor,
  Megaphone,
  LogOut,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/equipamentos", label: "Equipamentos", icon: Monitor },
  { href: "/avisos", label: "Avisos", icon: Megaphone },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r border-line bg-panel flex flex-col">
      <div className="px-5 py-5 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent status-pulse" />
          <span className="font-mono font-bold tracking-tight">InfraHub</span>
        </div>
        <p className="text-[11px] text-text-dim mt-0.5 font-mono">Vera Cruz · Braga IT</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-panel-2 text-accent border border-line"
                  : "text-text-dim hover:text-text hover:bg-panel-2"
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mx-3 mb-4 flex items-center gap-3 px-3 py-2 rounded-md text-sm text-text-dim hover:text-danger hover:bg-panel-2 transition-colors"
      >
        <LogOut size={16} />
        Sair
      </button>
    </aside>
  );
}
