'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckoutForm } from './CheckoutForm';
import { getCustomerById } from "../../lib/services"; // Import your server-side data fetching logic

type Product = {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
};

const CheckoutPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [customerData, setCustomerData] = useState<any>(null); // Define state for customer data

    // Retrieve products and customer data from local storage and server
    useEffect(() => {
        const storedProducts = localStorage.getItem("cartProducts");
        const totalPrice = localStorage.getItem("totalPrice");
        if (totalPrice) {
            setTotalPrice(parseFloat(totalPrice));
        }
        if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
        }

        // Fetch customer data (ensure this is asynchronous if necessary)
        const fetchCustomerData = async () => {
            const data = await getCustomerById("1"); // Call your data fetching function
            setCustomerData(data);
        };

        fetchCustomerData();
    }, []);

    return (
        <div className="flex h-screen">
            {/* Address Form Section */}
            <div className="w-3/5 p-6">
                <h2 className="text-lg font-medium mb-4">Shipping Details</h2>
                <CheckoutForm products={products} totalPrice={totalPrice} customer={customerData} />
            </div>
            {/* Cart Section */}
            <div className="w-3/5 p-1 mr-10 mt-10">
                <div className="flow-root">
                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                        {products.map((product) => (
                            <li key={product.id} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img src={product.image} alt={product.title} className="h-full w-full object-cover object-center" />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                        <div className="flex justify-between text-base font-medium ">
                                            <h3>
                                                <a href={`/products/${product.id}`}>{product.title}</a>
                                            </h3>
                                            <p className="ml-4">${product.price.toFixed(2)}</p>
                                        </div>
                                        <p className="mt-1 text-sm">{product.category}</p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                        <p>Qty {product.quantity}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border-t pt-4 mt-20">
                    <div className="flex justify-between text-base font-medium">
                        <p>Total</p>
                        <p>${totalPrice.toFixed(2)}</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CheckoutPage;