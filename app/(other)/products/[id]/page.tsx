'use client';

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { fetchProductData, ProductData } from "../../../../lib/services"

// Your ProductPage component
export default function ProductPage() {
    const { id } = useParams(); // Extract the productId directly from URL params
    const productId = Array.isArray(id) ? id[0] : id; // Ensure productId is a string


    const [productData, setProductData] = useState<ProductData[] | null>(null);
    const [color, setColor] = useState("");
    const [storage, setStorage] = useState("");
    const [ram, setRam] = useState("");
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Fetch product data when the component mounts or when the product ID changes
    useEffect(() => {
        console.log("Product ID:", productId);
        if (productId) {
            const fetchData = async () => {
                console.log("Fetching product data for ID:", productId);
                const data = await fetchProductData(productId);
                console.log(data); // Check the returned data
                if (data) {
                    setProductData(data);
                    setPrice(data[0].Price); // Assuming price is available in the first row
                    setStock(data[0].Quantity); // Assuming quantity is stock
                    setColor(data[0].Variant_Type || ""); // Set the initial color from the data
                    setStorage(""); // Initialize storage options
                    setRam(""); // Initialize RAM options
                }
                setLoading(false);
            };
            fetchData();
        }
    }, [productId]);

    const handleAddToCart = () => {
        toast({
            title: "Added to cart",
            description: `${quantity} ${productData ? productData[0].Field : ''} added to your cart.`,
        });
    };

    if (loading || !productData) {
        return <Skeleton className="h-64 w-full" />; // Loading state if data isn't ready
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-4">
                    <img
                        src={productData[0].Image || "/placeholder.svg?height=400&width=400"}
                        alt={productData[0].Field}
                        className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <div className="bg-muted p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">Description</h2>
                        <p>{productData[0].Field}</p>
                        <p className="mt-2"><strong>Weight:</strong> {productData[0].Price}kg</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{productData[0].Field}</h1>
                    <p className="text-2xl font-semibold">${}</p>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Color</h2>
                        <RadioGroup value={color} onValueChange={setColor} className="flex space-x-2">
                            <div key={color} className="flex items-center space-x-2">
                                <RadioGroupItem value={color} id={`color-${color}`} />
                                <Label
                                    htmlFor={`color-${color}`}
                                    className={cn(
                                        "px-3 py-1 rounded-full cursor-pointer transition-colors",
                                        color === color ? "bg-primary text-primary-foreground" : "bg-secondary"
                                    )}
                                >
                                    {color}
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Storage</h2>
                        <Select value={storage} onValueChange={setStorage}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select storage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="64GB">64GB</SelectItem>
                                <SelectItem value="128GB">128GB</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">RAM</h2>
                        <Select value={ram} onValueChange={setRam}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select RAM" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="4GB">4GB</SelectItem>
                                <SelectItem value="8GB">8GB</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Quantity</h2>
                        <Input
                            type="number"
                            min="1"
                            max={stock}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, stock))}
                            className="w-20"
                        />
                    </div>

                    <div className="text-sm">
                        {stock > 0 ? (
                            <span className="text-green-600">In stock: {stock} available</span>
                        ) : (
                            <span className="text-red-600">Out of stock</span>
                        )}
                    </div>

                    <Button
                        onClick={handleAddToCart}
                        disabled={stock === 0}
                        className="w-full"
                    >
                        {stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                </div>
            </div>
        </div>
    );
}