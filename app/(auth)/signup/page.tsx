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

const SignUp = () => {
  const [pending, setPending] = useState(false);
  const router = useRouter(); // Get router instance

  return (
    // <div className="min-h-screen flex flex-col justify-center bg-white">
    //   <div className="text-sm mb-6">
    //         <a href="/" className="text-primarycolour">Home</a> / <span>Signup</span>
    //       </div>
    //   <div className="flex max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
    //     {/* Left Panel */}
    //     <div className="w-25% bg-primarycolour text-white p-8 text-center ">
    //       <h2 className="text-3xl font-semibold mb-4 mt-20">Welcome Back!</h2>
    //       <p className="mb-8">
    //         Already have an account? <br /> Login with your personal info
    //       </p>
    //       <button className="mt-4 inline-block bg-white text-primarycolour py-2 px-6 rounded-full hover:bg-gray-100">
    //         <a href="/login">Login</a>
    //       </button>
    //     </div>

    //     {/* Right Panel */}
    //     <div className="w-2/3 p-8">
    //       {/* Breadcrumb */}
          

    //       {/* Form */}
    //       <form className="space-y-4">
    //         {/* Personal Details */}
    //         <div>
    //           <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
    //           <div className="grid grid-cols-2 gap-4">
    //             <input
    //               type="text"
    //               placeholder="First Name"
    //               className="border rounded-md p-2 w-full"
    //             />
    //             <input
    //               type="text"
    //               placeholder="Last Name"
    //               className="border rounded-md p-2 w-full"
    //             />
    //             <input
    //               type="email"
    //               placeholder="Email"
    //               className="border rounded-md p-2 w-full"
    //             />
    //             <input
    //               type="text"
    //               placeholder="Telephone Number"
    //               className="border rounded-md p-2 w-full"
    //             />
    //           </div>
    //         </div>

    //         {/* Address */}
    //         <div>
    //           <h3 className="text-lg font-semibold mb-4">Address</h3>
    //           <div className="grid grid-cols-2 gap-4">
    //             <input
    //               type="text"
    //               placeholder="House Number"
    //               className="border rounded-md p-2 w-full"
    //             />
    //             <input
    //               type="text"
    //               placeholder="Address Line 1"
    //               className="border rounded-md p-2 w-full"
    //             />
    //             <input
    //               type="text"
    //               placeholder="Address Line 2"
    //               className="border rounded-md p-2 w-full"
    //             />
    //             <input
    //               type="text"
    //               placeholder="City"
    //               className="border rounded-md p-2 w-full"
    //             />
    //             <input
    //               type="text"
    //               placeholder="Zipcode"
    //               className="border rounded-md p-2 w-full"
    //             />
    //           </div>
    //         </div>

    //         {/* Password */}
    //         <div>
    //           <h3 className="text-lg font-semibold mb-4">Password</h3>
    //           <div className="grid grid-cols-2 gap-4">
    //             <input
    //               type="password"
    //               placeholder="Password"
    //               className="border rounded-md p-2 w-full"
    //             />
    //             <input
    //               type="password"
    //               placeholder="Re enter Password"
    //               className="border rounded-md p-2 w-full"
    //             />
    //           </div>
    //         </div>

    //         {/* Sign Up Button */}
    //         <div className="mt-1">
    //           <button
    //             type="submit"
    //             className="mt-4 w-full px-4 py-2 bg-primarycolour text-white rounded-md hover:bg-zinc-950"
    //           >
    //             SIGN UP
    //           </button>
    //         </div>
    //       </form>
    //     </div>
    //   </div>
    // </div>
    <div className="container relative h-[100dvh] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
    <div className="relative hidden h-full w-full flex-col bg-muted dark:border-r lg:flex">
        <Image
            loading="eager" // preloads the image before it's in the viewport
            fill // stretches the image to fit the container
            sizes="(max-width: 640px) 100vw, 640px" // responsive image sizes
            src="/Modern Chic Wardrobe with Industrial Flair.jpg"
            alt="Modern Chic Wardrobe with Industrial Flair"
            className="object-cover"
        />
    </div>
    <div className="pt-16 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Sign Up
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your username and password
                </p>
            </div>
            <div className="grid gap-6">
                <form>
                    <div className="grid gap-2">
                        <div className="grid gap-1">
                            <Label className="py-2" htmlFor="firstname">
                                First Name
                            </Label>
                            <Input
                                id="firstname"
                                name="firstname"
                                placeholder="firstname"
                                autoComplete="firstname"
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
};

export default SignUp;
