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

export default async function UserAvatarOptions() {
    const user: User | null = await getCurrentUser();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={clsx(
                        "overflow-hidden rounded-full ",
                        user?.isAdmin && "border-yellow-400", // Highlight the admin border
                    )}
                >
                    <Image
                        src={
                            user?.isAdmin
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
                    {capitalizeFirstCharOfEveryWord(
                        user?.name?.firstname + " " + user?.name?.lastname,
                    )}
                </DropdownMenuLabel>

                {/* Only render the dashboard link for admins */}
                {user?.isAdmin && (
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
