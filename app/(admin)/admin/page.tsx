"use client"
import React, { useState } from 'react';
import { CreditCard, DollarSign, Package, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Sample data generators
const generateQuarterlySales = (year:string) => {
  return [
    { quarter: 'Q1', sales: Math.floor(Math.random() * 50000) + 10000 },
    { quarter: 'Q2', sales: Math.floor(Math.random() * 50000) + 10000 },
    { quarter: 'Q3', sales: Math.floor(Math.random() * 50000) + 10000 },
    { quarter: 'Q4', sales: Math.floor(Math.random() * 50000) + 10000 },
  ];
};


const generateTopProducts = () => {
  return [
    { name: 'Product A', sales: 234 },
    { name: 'Product B', sales: 189 },
    { name: 'Product C', sales: 156 },
    { name: 'Product D', sales: 123 },
    { name: 'Product E', sales: 99 },
  ];
};

const generateCategoryData = () => {
  return [
    { category: 'Electronics', orders: 456 },
    { category: 'Clothing', orders: 389 },
    { category: 'Books', orders: 245 },
    { category: 'Home', orders: 198 },
    { category: 'Sports', orders: 167 },
  ];
};

const generateProductInterest = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: `Month ${i + 1}`,
    views: Math.floor(Math.random() * 1000) + 100,
    orders: Math.floor(Math.random() * 100) + 10,
  }));
};

const DashboardPage = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  
  const quarterlySales = generateQuarterlySales(selectedYear);
  const topProducts = generateTopProducts();
  const categoryData = generateCategoryData();
  const productInterest = generateProductInterest();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive platform analytics and reporting
            </p>
          </div>
          <div className="flex gap-4">
            <Select defaultValue={selectedYear} onValueChange={setSelectedYear}>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$234,567</div>
              <p className="text-xs text-muted-foreground">+12.5% from last period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+8.2% from last period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">+15.3% from last period</p>
            </CardContent>
          </Card>
        </div>

        {/* Quarterly Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Sales Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products and Categories */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Interest Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Product Interest Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productInterest}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="views" stroke="#3b82f6" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;