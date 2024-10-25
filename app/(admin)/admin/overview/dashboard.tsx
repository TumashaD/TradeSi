"use client";
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { generateQuarterlySales, getTotalRevenue, getTotalCustomers, getTotalOrders, getQuarterlySales } from "@/lib/services";
import SummaryCard from "../../summaryCard";
import ChartBar from "../../barChart";
import ChartLine from "../../lineChart";
import { DollarSign, ShoppingBag, User, Users } from "lucide-react";
import { set } from "zod";
import { QuarterlySales } from "@/lib/types";

interface DashboardClientProps {
    initialData: {
        initialQuarterlySales: any[];
        initialTopProducts: any[];
        initialCategoryData: any[];
        initialProductInterest: any[];
    };
}

const DashboardClient = ({ initialData }: DashboardClientProps) => {
    const [selectedYear, setSelectedYear] = useState(2024);
    const [quarterlySales, setQuarterlySales] = useState<QuarterlySales[]>([]);
    const [topProducts] = useState(initialData.initialTopProducts);
    const [categoryData] = useState(initialData.initialCategoryData);
    const [productInterest] = useState(initialData.initialProductInterest);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [totalCustomers,totalOrders,totalRevenue,quarterlySales] = await Promise.all([
                    getTotalCustomers(),
                    getTotalOrders(),
                    getTotalRevenue(),
                    getQuarterlySales(selectedYear),
                ]);
                setTotalCustomers(totalCustomers || 0);
                setTotalOrders(totalOrders || 0);
                setTotalRevenue(totalRevenue || 0);
                setQuarterlySales(quarterlySales || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Only fetch new quarterly sales when year changes
    const handleYearChange = async (year: number) => {
        setSelectedYear(year);
        // const newQuarterlySales = await generateQuarterlySales(year);
        // setQuarterlySales(newQuarterlySales);
    };

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Analytics Dashboard
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Comprehensive platform analytics and reporting
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Select
                            defaultValue={selectedYear.toString()}
                            onValueChange={(value) => handleYearChange(Number(value))}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2022">2022</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard
                        title="Total Revenue"
                        amount={`$${totalRevenue}`}
                        logo={<DollarSign />}
                    />
                    <SummaryCard
                        title="Total Orders"
                        amount={totalOrders.toString()}
                        logo={<ShoppingBag />}
                    />
                    <SummaryCard
                        title="Total Customers"
                        amount={totalCustomers.toString()}
                        logo={<Users />}
                    />
                </div>

                {/* Charts */}
                <ChartBar
                    title="Quarterly Sales Report"
                    data={quarterlySales.map((item) => ({
                        quarter: `Q${item.Quarter}`,
                        quarterlySales: item.TotalRevenue,
                        total_orders: item.TotalOrders,
                    }))}
                    xAxisDataKey="quarter"
                    barDataKey="quarterlySales"
                    barFill="#3b82f6"
                />
                <div className="grid gap-4 md:grid-cols-2">
                    <ChartBar
                        title="Top Selling Products"
                        data={topProducts}
                        layout="vertical"
                        barDataKey="sales"
                        barFill="#10b981"
                        yAxisDataKey="name"
                        xaxisType="number"
                        yaxisType="category"
                    />
                    <ChartBar
                        title="Orders by Category"
                        data={categoryData}
                        xAxisDataKey="category"
                        barDataKey="orders"
                        barFill="#8b5cf6"
                    />
                </div>
                <ChartLine data={productInterest} />
            </div>
        </div>
    );
};

export default DashboardClient;
