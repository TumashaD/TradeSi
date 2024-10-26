// app/dashboard/page.tsx
import { Suspense } from 'react';
import DashboardClient from './overview/dashboard';
import { generateQuarterlySales, generateCategoryData, generateProductInterest, generateTopProducts } from "@/lib/services";

export default async function DashboardPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient />
    </Suspense>
  );
}