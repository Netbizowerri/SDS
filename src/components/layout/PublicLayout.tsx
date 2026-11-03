import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-emerald-500 selection:text-white w-full overflow-x-clip">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
