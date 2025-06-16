"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from "react";
import "../styles/globals.css";
import type { Viewport } from "next";
import ThemeToggle from "../components/ThemeToggle"; // Adjust if needed

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: "NIMBUS",
  description: "A full-stack AI chatbot using Next.js and FastAPI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  // ✅ Protection + Service Worker Registration
  useEffect(() => {
    // Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
          .then(registration => console.log("✅ Service Worker registered:", registration))
          .catch(error => console.error("❌ Service Worker registration failed:", error));
      });
    }

    // Block Zoom
    const preventZoom = (e: WheelEvent | KeyboardEvent) => {
      if ((e as WheelEvent).ctrlKey || (e as KeyboardEvent).metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventZoom, { passive: false });
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "-" || e.key === "=")) {
        e.preventDefault();
      }

      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    });

    // Block Right Click
    window.addEventListener("contextmenu", (e) => e.preventDefault());

    // Block Text Selection
    document.addEventListener("selectstart", (e) => e.preventDefault());

    return () => {
      window.removeEventListener("wheel", preventZoom);
      window.removeEventListener("keydown", preventZoom as any);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        {/* Set theme early */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />

        {/* Manifest and Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="./nimbus_logo.png" type="image/png" sizes="32x32" />
        <meta name="description" content="A full-stack AI chatbot using Next.js and FastAPI" />
        <title>NIMBUS</title>

        {/* CSS to block text selection */}
        <style>{`
          * {
            user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
          }
        `}</style>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-gray-50`}
      >
        {/* Theme Toggle if needed */}
        <ThemeToggle />

        {/* Main app */}
        {children}
      </body>
    </html>
  );
}
