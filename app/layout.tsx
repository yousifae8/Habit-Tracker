"use client"

import { Inter, Outfit } from "next/font/google";
import Providers from "./components/providers";
import {ThemeProvider} from "@mui/material/styles"

import theme from "./theme";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className={`${outfit.variable} ${inter.variable}`}>
      <ThemeProvider theme={theme}>
           <Providers>
         {children}
      </Providers>
    </ThemeProvider>
        </body>
      </html>
        
  );
}
