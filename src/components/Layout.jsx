import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 md:max-w-[80vw] mx-auto w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
