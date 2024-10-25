"use client";
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getTotalRevenue, getTotalCustomers, getTotalOrders, getQuarterlySales, getTopSellingProducts,generateTopProducts, getTopCategories } from "@/lib/services";
import SummaryCard from "../../summaryCard";
import ChartBar from "../../barChart";
import ChartLine from "../../lineChart";
import { DollarSign, ShoppingBag, Users } from "lucide-react";
import { QuarterlySales } from "@/lib/types";
import { get } from "http";
import ProductInterestAnalysis from "./productInterest";

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
    const [categoryData] = useState(initialData.initialCategoryData);
    const [productInterest] = useState(initialData.initialProductInterest);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [startDate, setStartDate] = useState<string>("2024-01-01");
    const [endDate, setEndDate] = useState<string>("2024-12-31");
    const [topSellingProducts, setTopSellingProducts] = useState<[]>([]);
    const [topCategories, setTopCategories] = useState<[]>([]);


    const handleDateRangeChange = async (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
        const newTopSellingProducts = await getTopSellingProducts(start, end);
        const newTopCategories = await getTopCategories(start, end);
        setTopSellingProducts(newTopSellingProducts || []);
        setTopCategories(newTopCategories || []);
        console.log('Selected date range:', { start, end });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [totalCustomers,totalOrders,totalRevenue,quarterlySales,topSellingProducts,topCategories] = await Promise.all([
                    getTotalCustomers(),
                    getTotalOrders(),
                    getTotalRevenue(),
                    getQuarterlySales(selectedYear),
                    getTopSellingProducts(startDate, endDate),
                    getTopCategories(startDate, endDate)
                ]);
                setTotalCustomers(totalCustomers || 0);
                setTotalOrders(totalOrders || 0);
                setTotalRevenue(totalRevenue || 0);
                setQuarterlySales(quarterlySales || []);
                setTopSellingProducts(topSellingProducts || []);
                setTopCategories(topCategories || []);
                console.log('Quarterly Sales:', quarterlySales);
                console.log('Top Selling Products:', topSellingProducts);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleYearChange = async (year: number) => {
        setSelectedYear(year);
        const newQuarterlySales = await getQuarterlySales(year);
        setQuarterlySales(newQuarterlySales || []);
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
                
                            <DatePickerWithRange 
                                className="w-full place-items-end" 
                                onDateRangeChange={handleDateRangeChange}
                            />
                <div className="grid gap-4 md:grid-cols-2">
                        <ChartBar
                            
                            title="Top Selling Products"
                            data={topSellingProducts.map((item: { Title: string; total_sold: number }) => ({
                                topProductName: item.Title,
                                topSellingProducts: parseInt(item.total_sold.toString(), 10)
                            }))}
                            layout="vertical"
                            barDataKey="topSellingProducts"
                            barFill="#10b981"
                            yAxisDataKey="topProductName"
                            xaxisType="number"
                            yaxisType="category"
                        />
                    <ChartBar
                        title="Orders by Category"
                        data={topCategories.map((item: { Category_Name: string; Order_Count: number }) => ({
                            category: item.Category_Name,
                            orders: item.Order_Count
                        }))}
                        xAxisDataKey="category"
                        barDataKey="orders"
                        barFill="#8b5cf6"
                    />
                    </div>
                <ProductInterestAnalysis year={selectedYear} />
            </div>
        </div>
    );
};

export default DashboardClient;