import React from "react";
import { ProfileForm } from "./ProfileForm";
import { Toaster } from "react-hot-toast"; // Import the Toaster component

const ProfilePage = () => {
  return (
    <div className="flex flex-col h-screen p-4">
      <Toaster/> {/* Toaster that shows notifications */}
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="flex-grow">
        <ProfileForm />
      </div>
    </div>
  );
};

export default ProfilePage;