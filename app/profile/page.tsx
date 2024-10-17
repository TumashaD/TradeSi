import React from "react";
import { ProfileForm } from "./ProfileForm";
import { Toaster } from "react-hot-toast"; // Import the Toaster component
import BackButton from "@/components/admin/back-button";

const ProfilePage = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top bar container with BackButton on the left and Profile text on the right */}
      <div className="flex w-full items-center px-8 py-4">
        <BackButton size={"sm"} route="/" /> 
        <h1 className="text-2xl font-bold ml-3">Profile</h1> 
      </div>

      <Toaster /> {/* Toaster that shows notifications */}
      
      {/* Main content container */}
      <div className="flex-grow px-8">
        <ProfileForm />
      </div>
    </div>
  );
};

export default ProfilePage;