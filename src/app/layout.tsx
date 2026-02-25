import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VertexCore",
  description: "A Team of Developers",
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
