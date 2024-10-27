// app/dashboard/page.tsx
import { Suspense } from 'react';
import DashboardClient from './overview/dashboard';

export default async function DashboardPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient />
    </Suspense>
  );
}