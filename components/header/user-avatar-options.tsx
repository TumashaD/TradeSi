import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser } from "@/lib/services";
import { User } from "@/types/user";
import clsx from "clsx";
import Link from "next/link";
import { capitalizeFirstCharOfEveryWord } from "@/lib/utils";
import { LogoutButton } from "@/components/header/logout-button";
import { LogIn } from "lucide-react";

export default async function UserAvatarOptions() {
    const user: User | null = await getCurrentUser();

    if (!user) {
        // User is a guest, display the login button
        return (
            <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-6 py-2 transition-all hover:bg-slate-100 hover:scale-105"
            >
                <Link href="/login" className="font-medium flex gap-3">
                    <LogIn className="w-4 h-4" />
                    Login
                </Link>
            </Button>
        );
    }

    // Authenticated user, show dropdown options
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={clsx(
                        "overflow-hidden rounded-full ",
                        user?.isAdmin && "border-yellow-400",
                    )}
                >
                    <Image
                        src={
                            user?.isAdmin
                                ? "/admin-avatar.png"
                                : "/user-avatar.png"
                        }
                        width={36}
                        height={36}
                        alt="Avatar"
                        className="overflow-hidden rounded-full"
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <Link href={"/profile"} passHref>
                    {capitalizeFirstCharOfEveryWord(
                        user?.firstName + " " + user?.lastName,
                    )}
                    </Link>
                </DropdownMenuLabel>
                <>
                    {user?.isAdmin && (
                        <DropdownMenuItem className="cursor-pointer">
                            <Link href={"/admin"} passHref>
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                    )}
                </>
                <LogoutButton />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
