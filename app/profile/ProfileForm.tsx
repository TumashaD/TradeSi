"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast"; // Import the toast function
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from 'lucide-react'; // Ensure you have lucide-react installed
import { User } from "@/types/user";

// Define the validation schema
const formSchema = z.object({
  First_Name: z.string().min(1, { message: "First name is required." }),
  Last_Name: z.string().min(1, { message: "Last name is required." }),
  Email: z.string().email({ message: "Invalid email address." }),
  Password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  Telephone: z.string().min(10, { message: "Telephone number is required." }),
  House_No: z.string().min(1, { message: "House number is required." }),
  Address_Line1: z.string().min(1, { message: "Address line 1 is required." }),
  Address_Line2: z.string().optional(),
  City: z.string().min(1, { message: "City is required." }),
  Zipcode: z.string().min(1, { message: "Zip code is required." }),
});


interface ProfileFormProps {
  user: User | null; // Accept customer data as a prop
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      First_Name: user?.firstName || "",
      Last_Name: user?.lastName|| "",
      Email: user?.email|| "",
      Password: user?.password, // Consider removing default password in production
      Telephone: user?.telephone || "",
      House_No: user?.houseNo || "",
      Address_Line1: user?.addressLine1 || "",
      Address_Line2: user?.addressLine2 || "",
      City: user?.city|| "",
      Zipcode: user?.zipcode || "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    
    // Set a flag in localStorage to track submission
    localStorage.setItem("formSubmitted", "true");

    // Refresh the page after setting the flag
    window.location.reload();
  };

  return (
    <Form {...form}>
      <div className="border p-8 rounded-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex justify-between space-x-12">
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            <FormField
              control={form.control}
              name="First_Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Last_Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter your password"
                        {...field}
                        type={showPassword ? "text" : "password"} // Toggle input type
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-8">
            <FormField
              control={form.control}
              name="Telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telephone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your telephone number" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="House_No"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House No</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your house number" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Address_Line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your address line 1" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Address_Line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your address line 2" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="City"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your city" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your zip code" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </form>

        {/* Submit Button */}
        <div className="w-full mt-4">
          <Button type="submit" className="w-full" onClick={form.handleSubmit(onSubmit)}>Submit</Button>
        </div>
      </div>
    </Form>
  );
}