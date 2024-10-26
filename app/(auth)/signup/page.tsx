"use client"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
 
const SignUp = () => {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // Check for password match
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      setPending(false);
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          telephone: data.telephone,
          houseNumber: data.houseNumber,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          zipcode: data.zipcode,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
      }

      toast.success(result.message);
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="container relative h-[100dvh] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full w-full flex-col bg-muted dark:border-r lg:flex">
        <Image
          loading="eager"
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          src="/signupimg.jpg"
          alt="Modern Chic Wardrobe with Industrial Flair"
          className="object-cover"
        />
      </div>
      <div className="pt-16 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Sign Up</h1>
            <p className="text-sm text-muted-foreground">
              Enter your details below
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={handleSignUp}>
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="firstname"
                    name="firstname"
                    placeholder="First Name"
                    autoComplete="firstname"
                    required
                    disabled={pending}
                  />
                  <Input
                    id="lastname"
                    name="lastname"
                    placeholder="Last Name"
                    autoComplete="lastname"
                    required
                    disabled={pending}
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    disabled={pending}
                  />
                  <Input
                    id="telephone"
                    name="telephone"
                    type="text"
                    placeholder="Telephone Number"
                    required
                    disabled={pending}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="houseNumber"
                    name="houseNumber"
                    placeholder="House Number"
                    required
                    disabled={pending}
                  />
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    placeholder="Address Line 1"
                    required
                    disabled={pending}
                  />
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    placeholder="Address Line 2"
                    required
                    disabled={pending}
                  />
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                    required
                    disabled={pending}
                  />
                  <Input
                    id="zipcode"
                    name="zipcode"
                    placeholder="Zipcode"
                    required
                    disabled={pending}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Password</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    disabled={pending}
                  />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter Password"
                    required
                    disabled={pending}
                  />
                </div>
              </div>

              {/* Sign Up Button */}
              <div className="mt-1">
                <Button
                  className="mt-4 w-full"
                  type="submit"
                  disabled={pending}
                >
                  Sign Up
                </Button>
              </div>
            </form>
          </div>
          <Link href="/login" className="text-center">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
