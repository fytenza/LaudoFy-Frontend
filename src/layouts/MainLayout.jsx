import React from 'react';
import { SidebarProvider } from '../contexts/SidebarContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Sidebar />
        
        <main className="pt-16 lg:pl-64">
          <div className="">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;