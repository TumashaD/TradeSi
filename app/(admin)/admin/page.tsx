// app/dashboard/page.tsx
import { Suspense } from 'react';
import DashboardClient from './overview/dashboard';
import { generateQuarterlySales, generateCategoryData, generateProductInterest, generateTopProducts } from "@/lib/services";

async function getData() {
  // Fetch all data in parallel
  const [
    initialQuarterlySales,
    initialTopProducts,
    initialCategoryData,
    initialProductInterest
  ] = await Promise.all([
    generateQuarterlySales('2024'),
    generateTopProducts(),
    generateCategoryData(),
    generateProductInterest()
  ]);

  return {
    initialQuarterlySales,
    initialTopProducts,
    initialCategoryData,
    initialProductInterest
  };
}

export default async function DashboardPage() {
  const initialData = await getData();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient initialData={initialData} />
    </Suspense>
  );
}