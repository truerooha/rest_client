import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/lib/telegram";
import { CartProvider } from "@/lib/cart";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Обед в Офис",
  description: "Сервис предзаказа корпоративных обедов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased`}>
        <TelegramProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
