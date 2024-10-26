'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { fetchProductData, ProductData, addCartItem, getCustomerCart } from "../../../../lib/services";
import { useStore } from "@/store/store";


export default function ProductPage() {
    const { id } = useParams(); 
    const productId = Array.isArray(id) ? id[0] : id;
    const [productData, setProductData] = useState<ProductData[] | null>(null);
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [attributeArray, setAttributeArray] = useState<string[]>([]);
    const [attributeMap, setAttributeMap] = useState<Map<string, string[]>>(new Map());
    const [selectedAttributes, setSelectedAttributes] = useState<Map<string, string>>(new Map());
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    useEffect(() => {
        if (productId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const ProductdataArray = await fetchProductData(productId);
                    if (ProductdataArray && ProductdataArray.length > 0) {
                        const newAttributeMap = new Map(attributeMap);
                        ProductdataArray[0].forEach(row => {
                            if (row.Attribute_Type_Name && row.value) {
                                if (!newAttributeMap.has(row.Attribute_Type_Name)) {
                                    newAttributeMap.set(row.Attribute_Type_Name, []);
                                }
                                const attributeNames = newAttributeMap.get(row.Attribute_Type_Name);
                                if (attributeNames && !attributeNames.includes(row.value)) {
                                    attributeNames.push(row.value);
                                }
                            }
                        });

                        const defaultRow = ProductdataArray[0][0];
                        if (defaultRow) {
                            setSelectedItemId(defaultRow.item_id);
                            setPrice(parseFloat(defaultRow.Base_price) + parseFloat(defaultRow.price_increment));
                            setStock(defaultRow.quantity || 0);
                            setAttributeArray([...newAttributeMap.keys()]);
                        }

                        setAttributeMap(newAttributeMap);
                        setProductData(ProductdataArray[0]);
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

    const handleAttributeChange = (attributeType: string, value: string) => {
        // Update the selected attributes map with the new selection
        selectedAttributes.set(attributeType, value);
        setSelectedAttributes(new Map(selectedAttributes)); // Trigger re-render
    
        // Get the item IDs that match each attribute in selectedAttributes
        const matchingItemIds = Array.from(selectedAttributes.entries()).map(([attrType, attrValue]) =>
            productData
                ?.filter((row) => row.Attribute_Type_Name === attrType && row.value === attrValue)
                .map((row) => row.item_id)
        );
    
        // Find the common item_id across all attributes
        const commonItemIds = matchingItemIds.reduce<number[]>((commonIds, ids) => {
            if (!ids) return commonIds; // Check if ids is undefined or empty
            return commonIds.filter((id) => ids.includes(id));
        }, matchingItemIds[0] || []);
    
        // Check if there’s a matching item with a common item_id
        if (commonItemIds.length > 0) { // Check if commonItemIds is not empty
            const matchedItem = productData?.find((row) => row.item_id === commonItemIds[0]);
            if (matchedItem) {
                setSelectedItemId(matchedItem.item_id);
                setPrice(parseFloat(matchedItem.Base_price) + parseFloat(matchedItem.price_increment));
                setStock(matchedItem.quantity || 0);
                return;
            }
        }
    
        // If no match is found, set defaults for unavailable combination
        setSelectedItemId(null);
        setPrice(-1);
        setStock(0);
    };
    
    // When Add to Cart is clicked, log the selected item_id and quantity if available
    const handleAddToCart = async () => {
        if (selectedItemId) {
            console.log("Selected item_id:", selectedItemId);
            console.log("Quantity:", quantity);

            const TotalPrice = (price * quantity).toFixed(2);
            console.log("Total Price:", TotalPrice);

            const customerCart: number | null = await getCustomerCart(1);
            console.log("Customer Cart:", customerCart);
            if (customerCart) {
                await addCartItem(customerCart, selectedItemId, quantity, parseFloat(TotalPrice));
            } else {
                console.error("No cart found");
            }

            // const addProduct = useStore().addProduct(selectedItemId, quantity);
            toast({
                title: "Added to cart",
                description: `${quantity} ${productData ? productData[0].Title : ''} added to your cart.`,
            });
        } else {
            toast({
                title: "Cannot add to cart",
                description: "Please select a valid combination.",
            });
        }
    };

    if (loading || !productData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <SkeletonLoading />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-4">
                    <img
                        src={productData[0].imageURL || "/placeholder.svg"}
                        alt={productData[0].Title}
                        className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <div className="bg-muted p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">Description</h2>
                        <p>{productData[0].Title}</p>
                        <p>{productData[0].Description}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{productData[0].Title}</h1>
                    <p className="text-2xl font-semibold">
                        {price === -1 ? "Not available, Try again later 😔" : typeof price === "number" ? `$${price}` : price}
                    </p>

                    {attributeArray.map((attributeType) => (
                        <div key={attributeType}>
                            <h2 className="text-lg font-semibold mb-2">{attributeType}</h2>
                            <Select 
                                value={selectedAttributes.get(attributeType)}
                                onValueChange={(value) => handleAttributeChange(attributeType, value)}
                                >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {attributeMap.get(attributeType)?.map((attributeName) => (
                                        <SelectItem key={attributeName} value={attributeName}>
                                            {attributeName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}

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