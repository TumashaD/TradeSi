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
    const [Field, setName] = useState("");
    const [selectedVariant, setSelectedVariant] = useState("");
    const [selectedAttribute, setSelectedAttribute] = useState("");
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [variantArray, setVariantArray] = useState<string[]>([]);
    const [attributeArray, setAttributeArray] = useState<string[]>([]);
    const [variantMap, setVariantMap] = useState<Map<string, string[]>>(new Map());
    const [attributeMap, setAttributeMap] = useState<Map<string, string[]>>(new Map());

    // Fetch product data when the component mounts or when the product ID changes
    useEffect(() => {
        if (productId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const ProductdataArray = await fetchProductData(productId);
                    if (ProductdataArray && ProductdataArray.length > 0) {
                        setProductData(ProductdataArray[0]); // This sets the first array of objects to productData
                        // Set default values from the first row of the data
                        const defaultRow = ProductdataArray[0][0]; // Access the first object in the nested array
                        if (defaultRow) {
                            // setSelectedVariant(defaultRow.Variant_Name || ""); // Fallback to an empty string if null
                            setSelectedAttribute(defaultRow.Attribute_Type_Name || ""); // Fallback to an empty string if null
                            setPrice(parseFloat(defaultRow.Base_price) + parseFloat(defaultRow.price_increment));
                            setStock(defaultRow.quantity || 0); // Fallback to 0 if null
                            setName(defaultRow.Title || "");

                            // Collect unique variants and attributes
                            // let variants: string[] = [];
                            let attributes: string[] = [];
                            
                            ProductdataArray[0].forEach(row => {
                                // if (row.Variant_Type && !variants.includes(row.Variant_Type)) {
                                //     variants.push(row.Variant_Type); // Add variant if not already present
                                // }
                                if (row.Attribute_Type_Name && !attributes.includes(row.Attribute_Type_Name)) {
                                    attributes.push(row.Attribute_Type_Name); // Add attribute if not already present
                                }
                            });

                            const variantMap = new Map<string, string[]>();  // Map to store variant type -> array of variant names
                            const attributeMap = new Map<string, string[]>();  // Map to store attribute type -> array of attribute names

                            // Iterate through productData to populate variantMap and attributeMap
                            ProductdataArray[0].forEach(row => {
                                // // Handle variant types and names
                                // if (row.Variant_Type && row.Variant_Name) {
                                //     if (!variantMap.has(row.Variant_Type)) {
                                //         variantMap.set(row.Variant_Type, []); // Create a new array for the variant type if it doesn't exist
                                //     }
                                //     const variantNames = variantMap.get(row.Variant_Type);
                                //     if (variantNames && !variantNames.includes(row.Variant_Name)) {
                                //         variantNames.push(row.Variant_Name); // Add the variant name if not already present (no duplicates)
                                //     }
                                // }

                                // Handle attribute types and names
                                if (row.Attribute_Type_Name && row.value) {
                                    if (!attributeMap.has(row.Attribute_Type_Name)) {
                                        attributeMap.set(row.Attribute_Type, []); // Create a new array for the attribute type if it doesn't exist
                                    }
                                    const attributeNames = attributeMap.get(row.Attribute_Type);
                                    if (attributeNames && !attributeNames.includes(row.value)) {
                                        attributeNames.push(row.value); // Add the attribute name if not already present (no duplicates)
                                    }
                                }
                            });

                            // setVariantArray(variants); // Set the unique variants
                            setAttributeArray(attributes); // Set the unique attributes
                            // setVariantMap(variantMap);
                            setAttributeMap(attributeMap);
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

    // // Handle variant selection change
    // const handleVariantChange = (variant: string) => {
    //     const selectedData = productData?.find(data => data.Variant_Name === variant && data.Attribute_Name === selectedAttribute);
    //     if (selectedData) {
    //         setSelectedVariant(variant);
    //         setPrice(selectedData.Price);
    //         setStock(selectedData.Quantity);
    //     }
    // };

    // Handle attribute selection change
    const handleAttributeChange = (attribute: string) => {
        const selectedData = productData?.find(data => data.Attribute_Name === attribute && data.Variant_Name === selectedVariant);
        if (selectedData) {
            setSelectedAttribute(attribute);
            setPrice(selectedData.Price);
            setStock(selectedData.Quantity);
        }
    };

    // Handle adding to cart
    const handleAddToCart = () => {
        // console.log("selectedVariant", selectedVariant);
        console.log("selectedAttribute", selectedAttribute);

        toast({
            title: "Added to cart",
            description: `${quantity} ${productData ? productData[0].Title : ''} added to your cart.`,
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

                {/* Product Details */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{productData[0].Title}</h1>
                    <p className="text-2xl font-semibold">{price}</p>

                    {/* Variant Selection
                    {variantArray.map((variantType) => (
                        <div key={variantType}>
                            <h2 className="text-lg font-semibold mb-2">{variantType}</h2>
                            <Select value={selectedVariant} onValueChange={handleVariantChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {variantMap.get(variantType)?.map((variantName) => (
                                        <SelectItem key={variantName} value={variantName}>
                                            {variantName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))} */}

                    {/* Attribute Selection */}
                    {attributeArray.map((attributeType) => (
                        <div key={attributeType}>
                            <h2 className="text-lg font-semibold mb-2">{attributeType}</h2>
                            <Select value={selectedAttribute} onValueChange={handleAttributeChange}>
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