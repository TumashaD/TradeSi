import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import {
    getMonthlyProductInterest,
    getAllProductNames,
} from "@/lib/services/admin";
interface ProductInterestAnalysisProps {
    year: number;
}

const ProductInterestAnalysis: React.FC<ProductInterestAnalysisProps> = ({
    year,
}) => {
    const [selectedProduct, setSelectedProduct] = useState<{
        Product_ID: number;
        Title: string;
    }>({ Product_ID: 0, Title: "" });
    const [products, setProducts] = useState<
        { Product_ID: number; Title: string }[]
    >([]);
    interface InterestData {
        period: string;
        order_count: number;
        is_peak_period?: boolean;
    }

    const [interestData, setInterestData] = useState<InterestData[]>([]);

    // Fetch products and interest data
    useEffect(() => {
        const fetchProductsAndInterestData = async () => {
            const products = await getAllProductNames();
            setProducts(products);
            if (products.length > 0) {
                setSelectedProduct(products[0]);
                const data = await getMonthlyProductInterest(
                    products[0].Product_ID,
                    year,
                );
                setInterestData(data);
            }
        };

        fetchProductsAndInterestData();
    }, [year]);

    // Fetch interest data when selectedProduct or year changes
    useEffect(() => {
        const fetchInterestData = async () => {
            if (selectedProduct.Product_ID !== 0) {
                const data = await getMonthlyProductInterest(
                    selectedProduct.Product_ID,
                    year,
                );
                setInterestData(data);
            }
        };

        fetchInterestData();
    }, [selectedProduct, year]);

    // Find peak period
    const peakPeriod = interestData.find((row) => row.is_peak_period);

    const handleProductChange = (value: string) => {
        const selected = products.find((product) => product.Title === value);
        if (selected) {
            setSelectedProduct(selected);
        }
        // In real app, you would fetch new data here based on the selected product
    };

    return (
        <div className="relative flex flex-col space-y-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Product Interest Analysis</CardTitle>
                    
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <Select
                            value={selectedProduct.Title}
                            onValueChange={handleProductChange}
                        >
                            <SelectTrigger className="w-full md:w-72">
                                <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem
                                        key={product.Product_ID}
                                        value={product.Title}
                                    >
                                        {product.Title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                            <div className="flex items-start space-x-4 absolute right-6 top-6">
                                <div className="rounded-full bg-blue-100 p-3 dark:bg-gray-700">
                                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                        Peak Interest Period
                                    </h3>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            <span className="font-medium">
                                                Time Period:
                                            </span>{" "}
                                            {peakPeriod?.period}
                                        </p>
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            <span className="font-medium">
                                                Number of Orders:
                                            </span>{" "}
                                            {peakPeriod?.order_count}
                                        </p>
                                    </div>
                                </div>
                            </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={interestData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="order_count"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={{ fill: "#2563eb" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductInterestAnalysis;
