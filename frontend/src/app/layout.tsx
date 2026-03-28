import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"
import ScrollProvider from "@/components/ScrollProvider"
;
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });
// ... (metadata)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ScrollProvider>
              {children}
            </ScrollProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
