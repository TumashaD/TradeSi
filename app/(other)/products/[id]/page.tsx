'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { fetchProductData, ProductData } from "../../../../lib/services";

export default function ProductPage() {
    const { id } = useParams(); // Extract the productId from URL params
    const productId = Array.isArray(id) ? id[0] : id; // Ensure productId is a string
    const [productData, setProductData] = useState<ProductData[] | null>(null);
    const [Field,setName] = useState("");
    const [selectedVariant, setSelectedVariant] = useState("");
    const [selectedAttribute, setSelectedAttribute] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Fetch product data when the component mounts or when the product ID changes
    useEffect(() => {
        if (productId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const Productdata = await fetchProductData(productId);
                    if (Productdata && Productdata.length > 0) {
                        setProductData(Productdata[0]); // This sets the inner array (first element) to productData
                        console.log(Productdata);
                        // Set default values from the first row of the data
                        const defaultRow = Productdata[0]?.[0]; // Access the first object in the nested array
                        if (defaultRow) {
                            setSelectedVariant(defaultRow.Variant_Name || ""); // Fallback to an empty string if null
                            setSelectedAttribute(defaultRow.Attribute_Name || ""); // Fallback to an empty string if null
                            setPrice(defaultRow.Price || ""); // Fallback to an empty string if null
                            setStock(defaultRow.Quantity || 0); // Fallback to 0 if null
                            setName(defaultRow.Field || "");
                        }
                        
                    }
                } catch (error) {
                    console.error("Error fetching product data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [productId]);

    // Handle variant selection change
    const handleVariantChange = (variant: string) => {
        const selectedData = productData?.find(data => data.Variant_Name === variant);
        if (selectedData) {
            setSelectedVariant(variant);
            setPrice(selectedData.Price);
            setStock(selectedData.Quantity);
        }
    };

    // Handle attribute selection change
    const handleAttributeChange = (attribute: string) => {
        const selectedData = productData?.find(data => data.Attribute_Name === attribute);
        if (selectedData) {
            setSelectedAttribute(attribute);
            setPrice(selectedData.Price);
            setStock(selectedData.Quantity);
        }
    };

    // Handle adding to cart
    const handleAddToCart = () => {
        toast({
            title: "Added to cart",
            description: `${quantity} ${productData ? productData[0].Field : ''} added to your cart.`,
        });
    };

    if (loading || !productData) {
        return (
            <div className="container mx-auto px-4 py-8">
                {/* Loading Skeleton */}
                <SkeletonLoading />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Product Image and Description */}
                <div className="space-y-4">
                    <img
                        src={productData[0].Image || "/placeholder.svg"}
                        alt={productData[0].Field}
                        className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <div className="bg-muted p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">Description</h2>
                        <p>{productData[0].Field}</p>
                    </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{productData[0].Field}</h1>
                    <p className="text-2xl font-semibold">${price}</p>

                    {/* Variant Selection (Storage, RAM, etc.) */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Storage</h2>
                        <Select value={selectedVariant} onValueChange={handleVariantChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select storage" />
                            </SelectTrigger>
                            <SelectContent>
                                {productData && productData.map((row) => (
                                    row.Variant_Name && <SelectItem key={row.Variant_ID} value={row.Variant_Name}>{row.Variant_Name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Attribute Selection (Battery, Color, etc.) */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Battery</h2>
                        <Select value={selectedAttribute} onValueChange={handleAttributeChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select battery" />
                            </SelectTrigger>
                            <SelectContent>
                                {productData && productData.map((row) => (
                                    row.Attribute_Name && <SelectItem key={row.Attribute_ID} value={row.Attribute_Name}>{row.Attribute_Name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quantity */}
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

                    {/* Stock Status */}
                    <div className="text-sm">
                        {stock > 0 ? (
                            <span className="text-green-600">In stock: {stock} available</span>
                        ) : (
                            <span className="text-red-600">Out of stock</span>
                        )}
                    </div>

                    {/* Add to Cart Button */}
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

// Loading skeleton component
function SkeletonLoading() {
    return (
        <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
}