// Add this line at the top of your file
"use client"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCustomer } from "@/lib/services";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use router to navigate programmatically
import { useState } from "react";
import { toast } from "react-hot-toast";

const SignUp = () => {
  const [pending, setPending] = useState(false);
  const router = useRouter(); // Get router instance

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    try {
        const formData = new FormData(event.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());

        // Check for password match
        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        // Prepare customer data
        const customerData = {
          firstName: data.firstname as string,
          lastName: data.lastname as string,
          email: data.email as string,
          telephone: data.telephone as string,
          houseNo: data.houseNumber as string,
          addressLine1: data.addressLine1 as string,
          addressLine2: data.addressLine2 as string,
          city: data.city as string,
          zipcode: data.zipcode as string,
          password: data.password as string,
          isAdmin: false, // Assuming default value
          isGuest: false, // Assuming default value
        };

        const result = await createCustomer(customerData);

        if (result.success) {
            toast.success("Account created successfully!");
            router.push('/login');
        } else {
            toast.error(result.message);
        }
    } catch (error) {
        toast.error("Failed to create account. Please try again.");
        console.error(error);
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
                <h3 className="text-lg font-semibold mb-4 mt-4">Address</h3>
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
                <h3 className="text-lg font-semibold mb-4 mt-4">Password</h3>
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
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
