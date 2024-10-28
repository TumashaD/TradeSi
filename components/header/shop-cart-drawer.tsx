"use client";

import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";
import router from "next/router";
import { getCurrentUser } from "@/lib/services/customer";
import { getCurrentGuestSession, createGuestSession } from "@/lib/user";


// Assuming these functions exist
import { Cart, getCustomerCart, getCartItems, deleteCartItem, getCartItemsWithDetails, getCurrentCart, CartItem, fetchCartData } from "@/lib/services/cart"; // Adjust import as necessary
import { useCart } from "@/lib/context/cardContext";

export function ShopCartDrawer() {
    const { itemsInCart , refreshCart, cartId} = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    // Define the type for your customer cart response
    // Fetch cart items when the component mounts
    // const loadCartData = async () => {
    //     try {
    //       const { cartId, cartItems } = await fetchCartData();
    //       setCartId(cartId);
    //       setItemsInCart(cartItems);
    //     } catch (error) {
    //       console.error("Error loading cart data:", error);
    //     }
    //   };
    //     useEffect(() => {
    //         loadCartData();
    //     }, []);

    // useEffect(() => {
    //     console.log("Cart ID:", cartId);
    //     console.log("Items in Cart:", itemsInCart);
    // }, [cartId, itemsInCart]);

    const handleRemoveProduct = async (itemId: number) => {
        setIsLoading(true);
        try {
            await deleteCartItem(cartId ?? 0, itemId);
            toast.success("Product removed from cart");
            // Reload the page to reflect changes
            await refreshCart();
            if (cartId !== undefined) {
                await getCartItems(cartId); // Re-fetch cart items after removal
            }
        } catch (error) {
            toast.error("Failed to remove product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet>
            <SheetTrigger
                className={cn(
                    buttonVariants({
                        variant: "outline",
                        size: "icon",
                        className: "relative",
                    }),
                )}
            >
                {itemsInCart.length > 0 && (
                    <span className="absolute right-0 top-0 -mr-1 -mt-2 flex h-5 w-5 items-center justify-center rounded-full  bg-red-500 text-xs text-white">
                    {itemsInCart.length}
                </span>
                )}
                <ShoppingBag />
            </SheetTrigger>
            <SheetContent
                className="flex flex-col justify-between overflow-auto"
                aria-controls="Tests"
            >
                <div className="space-y-2">
                    <SheetHeader>
                        <SheetTitle>Shopping Cart</SheetTitle>
                        <SheetDescription>
                            You can pay with Stripe or PayPal
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-2">
                        {itemsInCart.length === 0 ? (
                            <p>No products in the cart</p>
                        ) : (
                            itemsInCart.map((item) => (
                                <article
                                    key={item.Item_ID}
                                    className="group flex h-full max-h-full w-full animate-fadeIn flex-col space-y-2 rounded-md border-2 bg-background-secondary p-2 shadow-sm transition-opacity dark:border-0"
                                >
                                    <Link
                                        href={`/products/${item.Product_ID}`} // Assuming Item_ID links to product
                                        passHref
                                        className="flex max-h-36 flex-1 rounded bg-[#FEFAF6] py-4 dark:bg-white"
                                    >
                                        <Image
                                            src={item.imageURL} // You'll need to fetch this from the product details
                                            width={300}
                                            height={300}
                                            alt={item.Title}
                                            className="h-26 mx-auto w-20 object-contain transition duration-300 ease-in-out group-hover:scale-105"
                                        />
                                    </Link>
                                    <div className="flex flex-1 flex-col justify-between gap-2">
                                        <Link
                                            href={`/products/${item.Product_ID}`} // Assuming Item_ID links to product
                                            passHref
                                            className="line-clamp-2 text-sm font-semibold"
                                        >
                                            <abbr
                                                title={item.Title} // Assuming title is available
                                                className="no-underline"
                                            >
                                                {item.Title} {/* Assuming title is available */}
                                            </abbr>
                                        </Link>
                                        <p className="text-base font-bold leading-none">
                                            ${item.Price} {/* Assuming Price is available */}
                                        </p>
                                        <Button
                                            onClick={() => handleRemoveProduct(item.Item_ID)}
                                            size="icon"
                                            variant="destructive"
                                        >
                                            <Trash2 size={"23"} />
                                        </Button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-4 flex w-full flex-col justify-center gap-3">
                    <Button
                        disabled={isLoading}
                        variant="default"
                        size="lg"
                        onClick={() => {
                            localStorage.setItem("cartItems", JSON.stringify(itemsInCart)); // Save cartItems to local storage
                            router.push(`/checkout`); // Navigate to the checkout page
                        }}
                    >
                        {isLoading ? "Processing..." : "Checkout"}
                        {isLoading && <Loader className="animate-spin" />}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}