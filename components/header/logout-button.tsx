"use client";

import { logout } from "@/lib/user";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

export function LogoutButton() {
    const handleLogout = async () => {
        try {
            // Clear client-side storage first
            sessionStorage.removeItem("isAdmin");
            localStorage.removeItem("token");
            
            // Call server action to handle cookie removal and redirect
            await logout();
            
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to log out");
        }
    };

    return (
        <DropdownMenuItem 
            className="text-red-600 cursor-pointer" 
            onClick={handleLogout}
        >
            Sign out
        </DropdownMenuItem>
    );
}