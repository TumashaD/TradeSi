import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { getMonthlyProductInterest, getAllProductNames } from '@/lib/services';
interface ProductInterestAnalysisProps {
    year: number;
  }

const ProductInterestAnalysis: React.FC<ProductInterestAnalysisProps> = ({ year }) => {
  const [selectedProduct, setSelectedProduct] = useState<{ Product_ID: number; Title: string }>({ Product_ID: 0, Title: '' });
  const [products, setProducts] = useState<{ Product_ID: number; Title: string }[]>([]);
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
        const data = await getMonthlyProductInterest(products[0].Product_ID, year);
        setInterestData(data);
      }
    };

    fetchProductsAndInterestData();
  }, [year]);

  // Fetch interest data when selectedProduct or year changes
  useEffect(() => {
    const fetchInterestData = async () => {
      if (selectedProduct.Product_ID !== 0) {
        const data = await getMonthlyProductInterest(selectedProduct.Product_ID, year);
        setInterestData(data);
      }
    };

    fetchInterestData();
  }, [selectedProduct, year]);

  
  // Mock data - In real app, this would come from your API
//   const products = [
//     { id: '1', name: 'iPhone 14' },
//     { id: '2', name: 'Samsung Galaxy S23' },
//     { id: '3', name: 'MacBook Pro' },
//     { id: '4', name: 'PlayStation 5' },
//     { id: '5', name: 'AirPods Pro' }
//   ];

  // Mock interest data - In real app, this would come from your API based on the query
//   const interestData = [
//     { period: 'Jan 2024', orders: 12 },
//     { period: 'Feb 2024', orders: 18 },
//     { period: 'Mar 2024', orders: 15 },
//     { period: 'Apr 2024', orders: 25 },
//     { period: 'May 2024', orders: 20 }
//   ];

  // Find peak period
  const peakPeriod = interestData.find(row => row.is_peak_period);

  const handleProductChange = (value: string) => {
    const selected = products.find(product => product.Title === value);
    if (selected) {
      setSelectedProduct(selected);
    }
    // In real app, you would fetch new data here based on the selected product
  };

  return (
    <div className="flex flex-col space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Product Interest Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Select value={selectedProduct.Title} onValueChange={handleProductChange}>
              <SelectTrigger className="w-full md:w-72">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.Product_ID} value={product.Title}>
                    {product.Title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-xl bg-blue-50 place-self-center">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Peak Interest Period</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Time Period:</span> {peakPeriod?.period}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Number of Orders:</span> {peakPeriod?.order_count}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductInterestAnalysis;
