"use client";

import { useEffect, useState } from "react";
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

export default function UserAvatarOptions() {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Fetch the current user data
        async function fetchUser() {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        }
        fetchUser();

        // Check if the user is an admin
        setIsAdmin(sessionStorage.getItem("isAdmin") === "true");
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={clsx(
                        "overflow-hidden rounded-full",
                        isAdmin && "border-yellow-400" // Highlight the admin border
                    )}
                >
                    <Image
                        src={
                            isAdmin
                                ? "/admin-avatar.png" // Admin avatar
                                : "https://i.imgur.com/LFpAx5i.png" // Usual user avatar
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
                    <Link href="/profile" className="text-blue-500 hover:underline">
                        {capitalizeFirstCharOfEveryWord(
                            `${user?.name?.firstname || ""} ${user?.name?.lastname || ""}`
                        )}
                    </Link>
                </DropdownMenuLabel>

                {/* Only render the dashboard link for admins */}
                {isAdmin && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Link href="/admin" passHref>
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator />
                <LogoutButton />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
