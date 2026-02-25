import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tebex Shop",
  description: "Frontend-only Tebex shop on Vercel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
