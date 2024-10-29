"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/user";
import Image from "next/image";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LogInPage() {
    const { pending } = useFormStatus();
    const router = useRouter();

    const handleLogin = async (formData: FormData) => {
        try {
            const response = await login(formData);
            if (!response.errors) {
                toast.success("Logged in successfully.");
                router.push("/");
            }
            if (response.errors?.email) {
                toast.error(response.errors.email.toString());
            }
            if (response.errors?.password) {
                toast.error(response.errors.password.toString());
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong.");
        }
    };

    const handleGuestRedirect = () => {
        router.push("/");
    };

    return (
        <div className="container relative h-[100dvh] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full w-full flex-col bg-muted dark:border-r lg:flex">
                <Image
                    loading="eager"
                    fill
                    sizes="(max-width: 600px) 100vw, 640px"
                    src="/loginimg.jpg"
                    alt="new headphone"
                    className="object-cover"
                />
            </div>
            {/* Guest login button at the top-right corner */}
            <Button
                onClick={handleGuestRedirect}
                variant="outline"
                className="absolute top-4 right-4"
                size="sm"
            >
                Continue as Guest
            </Button>
            <div className="pt-16 lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Log In
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email and password
                        </p>
                    </div>
                    <div className="grid gap-6">
                        <form action={handleLogin}>
                            <div className="grid gap-2">
                                <div className="grid gap-1">
                                    <Label className="py-2" htmlFor="email">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        placeholder="email"
                                        autoComplete="email"
                                        defaultValue={""}
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
                                        defaultValue={""}
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
