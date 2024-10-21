import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import heroimage from "../layout/assets/heroimg.png";

export default function HeroSection() {
  return (
    <section className="block overflow-x-hidden px-[10%] bg-gray-300">
      <div className="relative flex w-full items-center justify-center">
        {/* Product images */}
        

        {/* Text section */}
        <div className="">
          <h1 className="text-4xl md:text-6xl font-semibold text-gray-900">
            Explore Best Products
          </h1>
          <p className="text-base md:text-lg text-white mt-4 font-semibold">
            Discover Excellence in Every Device <br />
            Unleash the Power of Premium Electronics
          </p>

          <Link
            href="/products"
            // className={buttonVariants({ variant: "outline" })}
          >
            <button className="mt-6 px-6 py-2 bg-primarycolour text-white rounded-md text-lg hover:bg-zinc-950 transition duration-200">
              Shop Now →
            </button>
          </Link>
        </div>
        <div className="">
          <img
            loading="eager"
            width={1400}
            height={1400}
            src={heroimage.src} // Update with your image source
            alt="JBL Speaker"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
