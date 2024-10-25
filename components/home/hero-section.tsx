import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="block overflow-x-hidden md:h-[45hv] lg:h-[55hv] xl:h-[70vh]">
            <article className="relative flex h-auto max-h-full w-auto max-w-full flex-row">
                <Image
                    loading="eager"
                    width={1600}
                    height={800}
                    priority={true}
                    src="/home.jpg"
                    alt="new macbook dark bg"
                    className="h-auto max-h-full max-w-full object-cover"
                />
                
                <div className="absolute flex h-full w-full flex-col items-center justify-center gap-4 pl-8 md:pl-16 lg:pl-24">
                    <h1 className=" animate-text bg-gradient-to-r from-white to-gray-300  bg-clip-text text-3xl font-black text-transparent dark:bg-gradient-to-r dark:from-blue-800 dark:to-indigo-900 md:text-7xl lg:text-9xl font-semibold">
                        TradeSi
                    </h1>

                    <h2
                        className="rounded-sm px-8 py-2 text-base font-bold lg:px-8 lg:text-3xl"
                        style={{ color: "rgb(248, 250, 252)" }}
                    >
                       Explore Best Products
                    </h2>
                    <div className="">
                    <Link
                        href="/products"
                        className={buttonVariants({ variant: "outline" })}
                    >
                        See All Products
                    </Link>
                    </div>
                </div>
            </article>
        </section>
    );
}
