// profile/page.tsx

import React from "react";
import { ProfileForm } from "./ProfileForm"; // Adjust the import based on your folder structure

const ProfilePage = () => {
  return (
    
    <div className="flex flex-col h-screen p-4"> {/* Ensure it uses the full height of the screen */}
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="flex-grow"> {/* This will allow ProfileForm to take up remaining space */}
        <ProfileForm /> {/* Use the ProfileForm component */}
      </div>
    </div>
  );
};

export default ProfilePage;