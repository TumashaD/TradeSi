import "@/app/globals.css";
import { ThemeProvider } from "@/contexts/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/lib/context/cardContext"; // Import CartProvider

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// metadata for html head to improve SEO
export const metadata: Metadata = {
    title: "TradeSi - Your One-Stop Shop",
    description:
        "Discover a spectrum of possibilities with our wide range of products. TradeSi, your one-stop shop for all your needs.",
    openGraph: {
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
            <body
                className={`${inter.variable} m-0 box-border flex min-h-screen flex-col items-center overflow-x-hidden p-0  font-sans outline-none`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <CartProvider> {/* Wrap with CartProvider */}
                        <Toaster />
                        {children}
                    </CartProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}