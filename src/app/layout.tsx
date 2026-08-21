import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SriLaYa Recipes",
  description: "Bilingual Tamil-English recipe collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
