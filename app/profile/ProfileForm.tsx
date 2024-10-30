"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user";
import { updateCustomer } from "@/lib/services/customer";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CardManager from "./FullScreenCardManager";

interface ProfileFormProps {
  user: User | null; // Accept customer data as a prop
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    First_Name: user?.firstName || "",
    Last_Name: user?.lastName || "",
    Email: user?.email || "",
    Telephone: user?.telephone || "",
    House_No: user?.houseNo || "",
    Address_Line1: user?.addressLine1 || "",
    Address_Line2: user?.addressLine2 || "",
    City: user?.city || "",
    Zipcode: user?.zipcode || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log("Form submitted", formData);
    if (user?.id !== undefined) {
      updateCustomer(user.id, {
        ...user,
        firstName: formData.First_Name,
        lastName: formData.Last_Name,
        email: formData.Email,
        telephone: formData.Telephone,
        houseNo: formData.House_No,
        addressLine1: formData.Address_Line1,
        addressLine2: formData.Address_Line2,
        city: formData.City,
        zipcode: formData.Zipcode,
      })
        .then(() => {
          toast.success("Profile updated successfully");
          // reload the page to reflect the changes
          router.refresh();
        })
        .catch((error) => {
          console.error("Error updating profile", error);
          toast.error("Failed to update profile");
        });
    }
    e.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit} className="border p-8 rounded-md">
      <div className="flex justify-between space-x-12">
        {/* Left Column */}
        <div className="flex-1 space-y-8">
          <div>
            <label>First Name</label>
            <Input
              name="First_Name"
              placeholder="Enter your first name"
              value={formData.First_Name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Last Name</label>
            <Input
              name="Last_Name"
              placeholder="Enter your last name"
              value={formData.Last_Name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Email</label>
            <Input
              name="Email"
              placeholder="Enter your email"
              value={formData.Email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Telephone</label>
            <Input
              name="Telephone"
              placeholder="Enter your telephone number"
              value={formData.Telephone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 space-y-8">
         

          <div>
            <label>House No</label>
            <Input
              name="House_No"
              placeholder="Enter your house number"
              value={formData.House_No}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Address Line 1</label>
            <Input
              name="Address_Line1"
              placeholder="Enter your address line 1"
              value={formData.Address_Line1}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Address Line 2 (optional)</label>
            <Input
              name="Address_Line2"
              placeholder="Enter your address line 2"
              value={formData.Address_Line2}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>City</label>
            <Input
              name="City"
              placeholder="Enter your city"
              value={formData.City}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Zip Code</label>
            <Input
              name="Zipcode"
              placeholder="Enter your zip code"
              value={formData.Zipcode}
              onChange={handleChange}
            />
          </div>

          
        </div>
      </div>

      {/* Submit Button */}
      <div className="w-full mt-4">
        <Button type="submit" className="w-full">Submit</Button>
      </div>
    </form>
  );
}
