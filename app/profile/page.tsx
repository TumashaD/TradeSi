// profile/page.tsx

import React from "react";
import { useForm, FormProvider } from "react-hook-form"; // Ensure this import is correct
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "../../components/ui/form"; // Adjust the path based on your folder structure

const ProfilePage = () => {
  const methods = useForm(); // Get the form methods

  const onSubmit = (data: any) => {
    console.log(data); // Handle form submission
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <FormProvider {...methods}> {/* Wrap the form with FormProvider */}
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={methods.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <input {...field} placeholder="Enter your first name" />
                </FormControl>
                <FormDescription>Your first name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <input {...field} placeholder="Enter your last name" />
                </FormControl>
                <FormDescription>Your last name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">
            Save Profile
          </button>
        </form>
      </FormProvider>
    </div>
  );
};

export default ProfilePage;