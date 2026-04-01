import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Digital Heroes | Golf Charity Subscription Platform",
  description: "Track your performance, enter monthly draws, and support charities with every subscription.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <footer style={{ 
          padding: '4rem 0', 
          borderTop: '1px solid var(--glass-border)',
          marginTop: '5rem',
          textAlign: 'center',
          opacity: 0.6,
          fontSize: '0.9rem'
        }}>
          <p>&copy; 2026 Digital Heroes. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
