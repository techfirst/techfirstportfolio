import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BeakerIcon } from "lucide-react";
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
          <footer className="bg-white text-gray-600 py-8 border-t border-gray-200">
            <div className="container mx-auto px-4">
              <div className="w-full max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Connect
                      </h3>
                      <div className="flex flex-col gap-3">
                        <Link
                          href="https://www.linkedin.com/in/stellan-bergstr%C3%B6m-34522162/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                        >
                          LinkedIn
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between sm:items-end gap-6">
                    <Link
                      href="/"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <BeakerIcon className="h-6 w-6 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        Technology First Sweden
                      </span>
                    </Link>
                    <div className="flex flex-col sm:items-end gap-2">
                      <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Technology First Sweden AB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
