// app/profile/page.tsx
import React from "react";
import { ProfileForm } from "./ProfileForm"; // Ensure this is a client component
import { Toaster } from "react-hot-toast"; // Import the Toaster component
import BackButton from "@/components/admin/back-button";
import { getCurrentUser } from "@/lib/services/customer"; // Import your server-side data fetching logic
import { User } from "@/types/user";
import CardManager from "./FullScreenCardManager";
import { getCustomerOrders } from "@/lib/services/admin";
import ProfileOrders from "./profileOrders";


const ProfilePage = async () => {
  // Fetch customer data on the server
  const user: User | null = await getCurrentUser();
  if (!user) {
    return null;
  }
  const orders = user.id ? await getCustomerOrders(user.id.toString()) : [];
  const ordersArray = Array.isArray(orders) ? orders : [];
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
        <div className="mb-6"> {/* Add margin-bottom here */}
          <ProfileForm user={user} />
        </div>
        <div className="flex gap-16 mb-4"> {/* Add margin-bottom here */}
          <CardManager customerId={user.id ?? 0} />
          <ProfileOrders orders={ordersArray} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;