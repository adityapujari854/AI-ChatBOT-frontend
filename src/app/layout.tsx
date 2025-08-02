import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import type { Viewport } from "next";
import dynamic from "next/dynamic";
import ThemeToggle from "../components/ThemeToggle";

// ✅ Dynamically import ClientScripts (inline client-only component)
const ClientScripts = dynamic(() =>
  Promise.resolve(function ClientScriptsWrapper() {
    // Marking this dynamic component as client
    if (typeof window !== "undefined") {
      // Service worker
      window.addEventListener("load", () => {
        navigator.serviceWorker?.register("/sw.js")
          .then(reg => console.log("✅ Service Worker registered:", reg))
          .catch(err => console.error("❌ Service Worker failed:", err));
      });

      const preventZoom = (e) => {
        if (e.ctrlKey || e.metaKey) e.preventDefault();
      };

      const preventKeys = (e) => {
        const zoomKeys = ["+", "-", "="];
        const devKeys = ["F12", "I", "J", "U"];
        if ((e.ctrlKey || e.metaKey) && zoomKeys.includes(e.key)) e.preventDefault();
        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && devKeys.includes(e.key)) ||
          (e.ctrlKey && e.key === "U")
        ) {
          e.preventDefault();
        }
      };

      window.addEventListener("wheel", preventZoom, { passive: false });
      window.addEventListener("keydown", preventKeys);
      window.addEventListener("contextmenu", (e) => e.preventDefault());
      document.addEventListener("selectstart", (e) => e.preventDefault());
    }

    return null;
  }),
  { ssr: false }
);

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
  return (
    <html lang="en">
      <head>
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
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="./nimbus_logo.png" type="image/png" sizes="32x32" />
        <meta name="description" content="A full-stack AI chatbot using Next.js and FastAPI" />
        <title>NIMBUS</title>
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
        <ThemeToggle />
        {children}
        <ClientScripts />
      </body>
    </html>
  );
}
