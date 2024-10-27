import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import mobile from "../layout/assets/mobile.png";
import headset from "../layout/assets/headset.png";
import lap from "../layout/assets/lap.png";
import watch from "../layout/assets/watch.png";

export default function GridSection() {
    return (
        <section className="flex items-center justify-center mx-[5%] sm:p-8">
            <div className="grid gap-4 lg:grid-cols-2 w-full">
                {/* Mobile Phones section */}
                <div className="flex flex-col  rounded-lg bg-primarycolour p-6 justify-center">
                
                    <img
                        loading="eager"
                        width={400}
                        height={400}
                        src={mobile.src} // Update with your image source
                        alt="mobile"
                        className="object-cover"
                    />
                    <h1 className="text-xl font-bold text-white text-center mt-4 justify-center font-medium">
                        Mobile Phones
                    </h1>
                </div>

                {/* Headphones, Laptops, and Smartwatches */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Headphones section */}
                    <div className="flex flex-col justify-between rounded-lg bg-gray-600 p-6">
                    <img
                        loading="eager"
                        width={150}
                        height={150}
                        src={headset.src} // Update with your image source
                        alt="mobile"
                        className="object-cover"
                    />
                        <h1 className="text-lg font-bold text-white text-center mt-4">
                            Headphones
                        </h1>
                    </div>

                    {/* Laptops section */}
                    <div className="flex flex-col justify-between rounded-lg bg-blue-200 p-6">
                    <img
                        loading="eager"
                        width={200}
                        height={200}
                        src={lap.src} // Update with your image source
                        alt="mobile"
                        className="object-cover"
                    />
                        <h1 className="text-lg font-bold text-black text-center mt-4">
                            Laptops
                        </h1>
                    </div>

                    {/* Smartwatches section */}
                    <div className="col-span-2 flex  justify-between items-center rounded-lg bg-gray-200 p-6 px-20">
                    <img
                        loading="eager"
                        width={250}
                        height={250}
                        src={watch.src} // Update with your image source
                        alt="mobile"
                        className="object-cover"
                    />
                    <div>
                        <h1 className="text-lg font-bold text-black text-center mt-4">
                            Smartwatches
                        </h1>
                        <Button className="mt-4 bg-primarycolour text-white self-center">
                            <Link href="/products" className="text-sm">
                                See All Categories
                            </Link>
                        </Button>
                    </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
