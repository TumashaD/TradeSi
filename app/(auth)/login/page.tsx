"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions"; // Assuming this is for usual user login
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use router to navigate programmatically
import { useState } from "react";
import { toast } from "react-hot-toast";

// Define hardcoded admin credentials
const adminCredentials = [
  { username: "admin1", password: "admin123" },
  { username: "admin2", password: "admin456" },
];

export default function LogInPage() {
    const [pending, setPending] = useState(false);
    const router = useRouter(); // Get router instance
    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const enteredUsername = formData.get("username")?.toString() || "";
        const enteredPassword = formData.get("password")?.toString() || "";

        setPending(true); // Show loading state

        // Check if credentials match admin credentials
        const isAdmin = adminCredentials.some(
            (admin) => admin.username === enteredUsername && admin.password === enteredPassword
        );

        if (isAdmin) {
            sessionStorage.setItem("isAdmin", "true"); // Store admin flag in session storage
            toast.success("Logged in as Admin");
            router.push("/"); // Redirect to homepage (admin can access dashboard from there)
            return;
        }

        try {
            // Usual login flow for non-admin users
            await login(formData); // Assuming this logs in the user
            sessionStorage.setItem("isAdmin", "false"); // Store user flag in session storage
            toast.success("Logged in successfully");
            router.push("/"); // Redirect to homepage
        } catch (error) {
            console.error(error);
            toast.error("Invalid username or password.");
        } finally {
            setPending(false); // Remove loading state
        }
    };

    return (
        <div className="container relative h-[100dvh] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full w-full flex-col bg-muted dark:border-r lg:flex">
            <Image
                loading="eager" // preloads the image before it's in the viewport
                fill // stretches the image to fit the container
                sizes="(max-width: 600px) 100vw, 640px" // responsive image sizes
                src="/loginimg.jpg"
                alt="new headphone"
                className="object-cover"
            />
        </div>
        <div className="pt-16 lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Sign In
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your username and password
                    </p>
                </div>
                <div className="grid gap-6">
                    <form onSubmit={handleLogin}>
                        <div className="grid gap-2">
                            <div className="grid gap-1">
                                <Label className="py-2" htmlFor="username">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="username"
                                    autoComplete="username"
                                    defaultValue={"mor_2314"}
                                    required
                                    disabled={pending}
                                />
                                <Label className="py-2" htmlFor="password">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="****"
                                    defaultValue={"83r5^_"}
                                    required
                                    disabled={pending}
                                />
                            </div>
                            <Button
                                className="mt-2"
                                type="submit"
                                disabled={pending}
                            >
                                Sign In
                            </Button>
                        </div>
                    </form>
                </div>
                <Link href="/signup" className="text-center">
                    Don&apos;t have an account? Click to create one!
                </Link>
            </div>
        </div>
    </div>
    );
}


 