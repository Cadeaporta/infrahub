import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InfraHub",
  description: "One place for everything IT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
