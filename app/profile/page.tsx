// app/profile/page.tsx
import React from "react";
import { ProfileForm } from "./ProfileForm"; // Ensure this is a client component
import { Toaster } from "react-hot-toast"; // Import the Toaster component
import BackButton from "@/components/admin/back-button";
import { getCustomerById } from "../../lib/services"; // Import your server-side data fetching logic

const ProfilePage = async () => {
  // Fetch customer data on the server
  const customerData = await getCustomerById("1"); // Call your data fetching function

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top bar container with BackButton on the left and Profile text on the right */}
      <div className="flex w-full items-center px-8 py-4">
        <BackButton size={"sm"} route="/" />
        <h1 className="text-2xl font-bold ml-8">Profile</h1>
      </div>

      <Toaster /> {/* Toaster that shows notifications */}
      
      {/* Main content container */}
      <div className="flex-grow px-8">
        {/* Pass customer data to the ProfileForm component */}
        <ProfileForm customer={customerData} />
      </div>
    </div>
  );
};

export default ProfilePage;