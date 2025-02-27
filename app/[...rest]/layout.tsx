import "@/app/globals.css";
import { ThemeProvider } from "@/contexts/theme-provider";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

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
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Toaster />
                    {children}
                </ThemeProvider>
    );
}
