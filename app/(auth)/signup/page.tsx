"use client"; // This enables client-side interactivity in Next.js

import React from "react";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-white">
      <div className="text-sm mb-6">
            <a href="/" className="text-primarycolour">Home</a> / <span>Signup</span>
          </div>
      <div className="flex max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
        {/* Left Panel */}
        <div className="w-25% bg-primarycolour text-white p-8 text-center ">
          <h2 className="text-3xl font-semibold mb-4 mt-20">Welcome Back!</h2>
          <p className="mb-8">
            Already have an account? <br /> Login with your personal info
          </p>
          <button className="mt-4 inline-block bg-white text-primarycolour py-2 px-6 rounded-full hover:bg-gray-100">
            <a href="/login">Login</a>
          </button>
        </div>

        {/* Right Panel */}
        <div className="w-2/3 p-8">
          {/* Breadcrumb */}
          

          {/* Form */}
          <form className="space-y-4">
            {/* Personal Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="border rounded-md p-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="border rounded-md p-2 w-full"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border rounded-md p-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Telephone Number"
                  className="border rounded-md p-2 w-full"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="House Number"
                  className="border rounded-md p-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Address Line 1"
                  className="border rounded-md p-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Address Line 2"
                  className="border rounded-md p-2 w-full"
                />
                <input
                  type="text"
                  placeholder="City"
                  className="border rounded-md p-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Zipcode"
                  className="border rounded-md p-2 w-full"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Password</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Password"
                  className="border rounded-md p-2 w-full"
                />
                <input
                  type="password"
                  placeholder="Re enter Password"
                  className="border rounded-md p-2 w-full"
                />
              </div>
            </div>

            {/* Sign Up Button */}
            <div className="mt-1">
              <button
                type="submit"
                className="mt-4 w-full px-4 py-2 bg-primarycolour text-white rounded-md hover:bg-zinc-950"
              >
                SIGN UP
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
