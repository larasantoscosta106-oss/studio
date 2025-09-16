import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from '@/contexts/AppContext';
import { Inter as FontSans } from "next/font/google"
import './globals.css';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'Descarrego Digital',
  description: 'Gerenciador de Roteiro de Descarga',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <AppProvider>
          {children}
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
