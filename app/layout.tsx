import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Technology First Sweden - Portfolio",
  description:
    "Explore our portfolio of innovative tech experiments and side projects. Technology First Sweden showcases various solutions and tools developed to push the boundaries of what's possible.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  );
}
