"use client";  // Add this line at the top to mark this file as a Client Component

import Link from "next/link";
import { useState } from "react"; // Import useState hook

import MobileMenu from "@/components/layout/mobile-navbar";
import menuicon from "./assets/menuicon.png";
import downarrow from "./assets/downarrow.png";
import search from "./assets/search.png";
import profile from "./assets/profile.png";
import cart from "./assets/cart.png";

export function Navbar() {
    // State to manage dropdown visibility
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    return (
        <header className=" bg-background-secondary sticky top-0 z-30 flex w-[80%] items-center justify-between 
        gap-4 border-b px-32 py-4 sm:static sm:h-auto sm:px-6 bg-white shadow-m">
            <MobileMenu />
            <h1 className="font-bold md:text-2xl lg:text-4xl text-primarycolour font-Poppins">
                <Link href="/">TradeSi</Link>
            </h1>

            <div className="flex gap-12 text-primarycolour font-Poppins text-base">
            <div className="relative"> {/* Wrapping this section with relative positioning for the dropdown */}
                <div className="flex justify-center items-center gap-4 cursor-pointer" onClick={toggleDropdown}>
                    <img src={menuicon.src} alt="menu" className="h-8 w-8" />
                    <p className="text-lg text-primarycolour font-Poppins ">Browse Categories</p>
                    {/* <img src={downarrow.src} alt="down arrow" className="h-8 w-8" /> */}
                </div>

                {/* Dropdown menu */}
                {isDropdownVisible && (
                    <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white shadow-lg">
                        <ul className="py-2">
                            <li className="px-4 py-2 hover:bg-gray-100">
                                <Link href="/category/mobile-phones">Mobile Phones</Link>
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100">
                                <Link href="/category/laptops">Laptops</Link>
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100">
                                <Link href="/category/headphones">Headphones</Link>
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100">
                                <Link href="/category/smartwatches">Smartwatches</Link>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex gap-8 text-primarycolour justify-center items-center font-Poppins text-base">
                <Link href="/">Home</Link>
                <Link href="/products">Shop</Link>
            </div>

            <div className="flex justify-center items-center gap-8">
                <img src={search.src} alt="search" className="h-8 w-8" />
                <img src={profile.src} alt="profile" className="h-8 w-8" />
                <img src={cart.src} alt="cart" className="h-8 w-8" />
            </div>
        </div>
        </header>
    );
}
