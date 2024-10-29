import "@/app/globals.css";
import { MainNav } from "@/components/layout/admin-nav";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import BackButton  from "@/components/admin/back-button";
import AdminMobileMenu from "../../components/layout/admin-mobile-nav";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";
// metadata
export const metadata: Metadata = {
    title: "TradeSi | Admin Dashboard",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await verifySession();
    if (!session || !session.isAdmin) {
        redirect("/");
    }
    return (
        <>
            <Toaster />
            <div className="flex w-full items-center px-8">
                <BackButton size={"sm"} route="/" />

                <div className="flex-1">
                    <div className="flex h-16 items-center justify-end sm:justify-center">
                        <MainNav className="mx-6  hidden h-16 border-b sm:flex" />
                        <AdminMobileMenu />
                    </div>
                </div>
            </div>
            <div className="w-full">{children}</div>
        </>
    );
}
