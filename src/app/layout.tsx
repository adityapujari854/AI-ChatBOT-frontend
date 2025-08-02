import "./globals.css"; // adjust if needed
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientScripts from "../components/ClientScripts"; // adjust path as per your structure

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My App",
  description: "Some description here",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Inject client-side scripts here */}
        <ClientScripts />
        {children}
      </body>
    </html>
  );
}
