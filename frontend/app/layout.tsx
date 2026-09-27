import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "RetailX — Demand Forecasting & Dynamic Pricing",
  description: "Retail demand forecasting and dynamic pricing optimization built on Rossmann store sales data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, display: 'flex', minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '40px 48px', maxWidth: '860px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}