"use client"

import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store/store";
import { useMounted } from "@/hooks/use-mounted";

export default function ProductCard({ product }: { product: Product }) {

    const decQty = useStore.use.decQty();
    const products = useStore((state) => state.products);
    const productQnt = products.find((p) => p.id === product.id)?.quantity;
    console.log(product);


    const isMount = useMounted();
    if (!isMount) return null;

    return (
        <article className="group flex h-full max-h-full  w-full animate-fadeIn flex-col space-y-2 rounded-md border-2 bg-background-secondary p-4  shadow-sm transition-opacity dark:border-0">
            <Link
                href={`/products/${product.id}`}
                passHref
                className="flex max-h-48 flex-1 rounded bg-white py-4 dark:bg-white"
            >
                <Image
                    src={product.imageUrl}
                    width={300}
                    height={300}
                    alt={product.title}
                    className="mx-auto  h-40 w-40 object-contain transition duration-300 ease-in-out group-hover:scale-105"
                />
            </Link>
            <div className="flex flex-1 flex-col justify-between gap-4">
                <Link
                    href={`/products/${product.id}`}
                    passHref
                    className="line-clamp-2 text-sm font-semibold"
                >
                    <abbr title={product.title} className="no-underline">
                        {product.title}
                    </abbr>
                </Link>
                <p className="line-clamp-4 text-xs">
                    <abbr
                        title={product.description}
                        className="font-normal text-stone-600 no-underline dark:text-white dark:text-opacity-70"
                    >
                        {product.description}
                    </abbr>
                </p>

                <Link href={`/products?category=${product.category}`}>
                    <span className="w-fit rounded-md bg-[#DAC0A3] p-2 text-xs font-medium capitalize dark:bg-background">
                        {product.category}
                    </span>
                </Link>

                <div className="flex items-baseline justify-between">
                    <p className="text-base font-bold leading-none">
                        ${product.basePrice}
                    </p>
                </div>
            </div>
        </article>
    );
}
