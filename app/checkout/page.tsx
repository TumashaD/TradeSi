'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckoutForm } from './CheckoutForm';


type Product = {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
};

const CheckoutPage = () => {
    const searchParams = useSearchParams();
    const totalPrice = searchParams.get("totalPrice");
    const [products, setProducts] = useState<Product[]>([]);

    // Retrieve products from local storage
    useEffect(() => {
        const storedProducts = localStorage.getItem("cartProducts");
        if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
        }
    }, []);

    return (
        <div className="flex h-screen">
            {/* Cart Section */}
            <div className="w-3/5 p-1 mr-10 mt-10">
                {/* <h2 className="text-lg font-medium text-gray-900 mb-4">Shopping Cart</h2> */}
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
                                        {/* <div className="flex">
                                            <button type="button" className="font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
                                        </div> */}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border-t pt-4 mt-20">
                    <div className="flex justify-between text-base font-medium">
                        <p>Total</p>
                        <p>${totalPrice}</p>
                    </div>
                    {/* <div className="mt-6">
                        <a href="#" className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700">Checkout</a>
                    </div> */}
                    {/* <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                            or
                            <button type="button" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Continue Shopping
                                <span aria-hidden="true"> &rarr;</span>
                            </button>
                        </p>
                    </div> */}
                </div>
            </div>

            {/* Address Form Section */}
            <div className="w-3/5 p-6">
                <h2 className="text-lg font-medium mb-4">Shipping Details</h2>
                <CheckoutForm />
            </div>
        </div>
    );
};

export default CheckoutPage;