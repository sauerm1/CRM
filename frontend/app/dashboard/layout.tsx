'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'lg:pl-[250px]' : 'lg:pl-16'}`}>
        {children}
      </main>
    </div>
  );
}
