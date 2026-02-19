import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DependencyProvider } from "@/providers/DependencyProvider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistema de Turnos",
  description: "Sistema de gestión y visualización de turnos en tiempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <DependencyProvider>{children}</DependencyProvider>
      </body>
    </html>
  );
}
