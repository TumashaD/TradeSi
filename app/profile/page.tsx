// profile/page.tsx

import React from "react";
import { ProfileForm } from "./ProfileForm"; // Adjust the import based on your folder structure

const ProfilePage = () => {
  return (
    <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
            <h1 className="text-2xl font-bold">Profile</h1>
            <ProfileForm /> {/* Use the ProfileForm component */}
        </div>
    </div>
  );
};

export default ProfilePage;