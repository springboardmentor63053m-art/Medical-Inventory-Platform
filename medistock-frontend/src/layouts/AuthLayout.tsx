import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Pill } from "lucide-react";

export const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-700 opacity-20 pattern-grid"></div>
        <div className="relative z-10 flex flex-col items-center text-white text-center px-12">
          <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl">
            <Pill className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-6 tracking-tight">Medical Inventory Platform</h1>
          <p className="text-blue-100 text-lg max-w-md">
            Enterprise-grade management system for medicines, suppliers, and stock tracking.
          </p>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
