"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { toast } from "react-hot-toast";

export default function LogInPage() {
    const { pending } = useFormStatus();

    const handleLogin = async (formData: FormData) => {
        try {
            await login(formData);
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong.");
        }
    };

    return (
        <div className="min-h-screen w-full font-Poppins flex items-center justify-center bg-gray-100">
            <div className="flex w-full max-w-4xl shadow-lg rounded-lg overflow-hidden">
                {/* Left Side - Login Form */}
                <div className="w-1/2 p-8 bg-white">
                    <div className="mb-4">
                        <Link href="/" className="text-primarycolour text-sm">
                            Home
                        </Link>
                        <span className="text-gray-400 text-sm"> / Login</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
                    <form action={handleLogin} className="mt-4 space-y-4">
                        <div>
                            <Label className="block text-gray-600" htmlFor="username">
                                Username
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="username"
                                autoComplete="username"
                                defaultValue={"mor_2314"} // Default username
                                required
                                disabled={pending}
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:ring-1 focus:ring-primarycolour focus:outline-none"
                            />
                        </div>
                        <div>
                            <Label className="block text-gray-600" htmlFor="password">
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="****"
                                defaultValue={"83r5^_"} // Default password
                                required
                                disabled={pending}
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:ring-1 focus:ring-primarycolour focus:outline-none"
                            />
                        </div>
                        <Button
                            className="mt-4 w-full px-4 py-2 bg-primarycolour text-white rounded-md hover:bg-zinc-950"
                            type="submit"
                            disabled={pending}
                        >
                            SIGN IN
                        </Button>
                    </form>
                    
                </div>

                {/* Right Side - Image and CTA */}
                <div className="w-1/2 relative hidden lg:flex">
                    <Image
                        loading="eager"
                        fill
                        sizes="(max-width: 640px) 100vw, 640px"
                        src="/Modern Chic Wardrobe with Industrial Flair.jpg"
                        alt="Modern Chic Wardrobe with Industrial Flair"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-primarycolour text-white flex flex-col items-center justify-center p-8">
                        <h2 className="text-3xl font-bold">Hello!</h2>
                        <p className="mt-4">Don’t have an account?</p>
                        <Link href="/signup">
                            <div className="mt-4 inline-block bg-white text-primarycolour py-2 px-6 rounded-full hover:bg-gray-100
                            ">
                                Create an account
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
