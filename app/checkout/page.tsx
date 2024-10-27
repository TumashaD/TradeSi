'use client';

import { useEffect, useState } from "react";
import { CheckoutForm } from './CheckoutForm';
import { getCurrentUser } from "@/lib/services/customer"; 
import { Toaster } from 'react-hot-toast';

type CartItemDetail = {
    Item_ID: number;
    Quantity: number;
    Price: number;
    Product_ID: number;
    imageURL: string;
    Title: string;
    Description: string;
};

const CheckoutPage = () => {
    const [totalPrice, setTotalPrice] = useState(0);
    const [customerData, setCustomerData] = useState<any>(null);
    const [cartItems, setCartItems] = useState<CartItemDetail[]>([]);

    // Retrieve cartItems from local storage on mount
    useEffect(() => {
        const storedCartItems = localStorage.getItem("cartItems");
        if (storedCartItems) {
            const parsedCartItems = JSON.parse(storedCartItems);
            setCartItems(parsedCartItems);
        }
    }, []);

    // Calculate total price whenever cartItems change
    useEffect(() => {
        const calculateTotalPrice = (items: CartItemDetail[]) => {
            return items.reduce((total, item) => total + item.Price, 0);
        };

        setTotalPrice(calculateTotalPrice(cartItems));
    }, [cartItems]);

    // Fetch customer data
    useEffect(() => {
        const fetchCustomerData = async () => {
            const data = await getCurrentUser();
            if (data) {
                setCustomerData(data);
            }
        };

        fetchCustomerData();
    }, []);

    return (
        <div className="flex h-screen w-full">
            <Toaster /> {/* This needs to be included for toasts to show */}
            {/* Cart Section */}
            <div className="w-3/5 p-2 ml-10 mt-10">
                <div className="flow-root">
                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <li key={item.Item_ID} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img src={item.imageURL} alt={item.Title} className="h-full w-full object-cover object-center" />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                        <div className="flex justify-between text-base font-medium">
                                            <h3>
                                                <a href={`/products/${item.Product_ID}`}>{item.Title}</a>
                                            </h3>
                                            <p className="ml-4">${item.Price}</p>
                                        </div>
                                        <p className="mt-1 text-sm">{item.Description}</p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                        <p>Qty {item.Quantity}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border-t pt-4 mt-20">
                    <div className="flex justify-between text-base font-medium">
                        <p>Total</p>
                        <p>${Number(totalPrice).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Address Form Section */}
            <div className="w-3/5 p-6">
                <h2 className="text-lg font-medium mb-4">Shipping Details</h2>
                <CheckoutForm products={cartItems} totalPrice={totalPrice} customer={customerData} />
            </div>
        </div>
    );
};

export default CheckoutPage;