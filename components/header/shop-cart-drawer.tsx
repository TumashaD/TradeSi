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
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";
import router from "next/router";

export function ShopCartDrawer() {
    const router = useRouter();
    const [isLoading,setIsLoading] = useState(false);
    const products = useStore().products;
    const removeProduct = useStore().removeProduct;
    const incQty = useStore.use.incQty();
    const decQty = useStore.use.decQty();
    const calculateTotalPrice = () => {
        return products.reduce((total, product) => {
            return total + product.base_price * product.quantity;
        }, 0);
    };

    const onCheckout = () => {
        setIsLoading(true);
        // Store products in local storage
        localStorage.setItem("cartProducts", JSON.stringify(products));
        localStorage.setItem("totalPrice", calculateTotalPrice().toFixed(2));
        setTimeout(() => {
            setIsLoading(false);
            router.push(`/checkout`);
        }, 2000);
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
                {products.length > 0 && (
                    <span className="absolute right-0 top-0 -mr-1 -mt-2 flex h-5 w-5 items-center justify-center rounded-full  bg-red-500 text-xs text-white">
                    {products.length}
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
                        {products.map((product) => (
                            <article
                                key={product.product_id}
                                className="group flex h-full max-h-full  w-full animate-fadeIn flex-col space-y-2 rounded-md border-2 bg-background-secondary p-2  shadow-sm transition-opacity dark:border-0"
                            >
                                <Link
                                    href={`/products/${product.product_id}`}
                                    passHref
                                    className="flex max-h-36 flex-1 rounded bg-[#FEFAF6] py-4 dark:bg-white"
                                >
                                    <Image
                                        src={product.imageURL}
                                        width={300}
                                        height={300}
                                        alt={product.title}
                                        className="h-26  mx-auto w-20 object-contain transition duration-300 ease-in-out group-hover:scale-105"
                                    />
                                </Link>
                                <div className="flex flex-1 flex-col justify-between gap-2">
                                    <Link
                                        href={`/products/${product.product_id}`}
                                        passHref
                                        className="line-clamp-2 text-sm font-semibold"
                                    >
                                        <abbr
                                            title={product.title}
                                            className="no-underline"
                                        >
                                            {product.title}
                                        </abbr>
                                    </Link>
                                    <span className="w-fit rounded-md bg-[#DAC0A3] p-2 text-xs font-medium capitalize dark:bg-background">
                                        {product.category}
                                    </span>

                                    <div className="flex items-baseline justify-between">
                                        <p className="text-base font-bold leading-none">
                                            ${product.base_price.toFixed(2)}
                                        </p>
                                        <div className="flex items-center justify-between gap-1">
                                            <Button
                                                variant="outline"
                                                className="h-5 w-5 rounded-full bg-[#DAC0A3] p-0 dark:bg-background "
                                                size={"sm"}
                                                onClick={() =>
                                                    decQty(product.product_id, product)
                                                }
                                                disabled={!product.quantity}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span>{product.quantity || 0}</span>
                                            <Button
                                                variant="outline"
                                                className="mr-4 h-5 w-5 rounded-full bg-[#DAC0A3] p-0  dark:bg-background"
                                                size={"sm"}
                                                onClick={() =>
                                                    incQty(product.product_id, product)
                                                }
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    removeProduct(product.product_id)
                                                }
                                                size="icon"
                                                variant="destructive"
                                            >
                                                <Trash2 size={"23"} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex w-full flex-col justify-center gap-3">
                    <div className="flex justify-between">
                        <h1 className="text-xl font-bold">Total</h1>
                        <h2 className="text-lg font-bold">
                            ${calculateTotalPrice().toFixed(2)}
                        </h2>
                    </div>
                    <Button
                        disabled={isLoading}
                        variant="default"
                        size="lg"
                        onClick={onCheckout}
                    >
                        {isLoading ? "Processing..." : "Checkout"}
                        {isLoading && <Loader className="animate-spin" />}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
