"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, HelpCircle, ChevronRight, Menu, User } from "lucide-react";

export function Header() {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 relative">
            {/* Left: Breadcrumbs & Mobile Menu */}
            <div className="flex items-center gap-4">
                <button className="lg:hidden text-gray-500 hover:text-gray-700">
                    <Menu size={20} />
                </button>
                <nav className="hidden sm:flex items-center text-sm font-medium text-gray-500">
                    <span className="hover:text-gray-900 cursor-pointer transition-colors">Home</span>
                    {paths.map((path, index) => (
                        <div key={path} className="flex items-center">
                            <ChevronRight size={16} className="mx-2 text-gray-400" />
                            <span className={`capitalize ${index === paths.length - 1 ? 'text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-md' : 'hover:text-gray-900 transition-colors'}`}>
                                {path}
                            </span>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Right: Search & Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Search Bar */}
                <div className="relative hidden md:block w-64 lg:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search... (Cmd+K)"
                        className="block w-full pl-10 pr-3 py-1.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white">⌘K</span>
                    </div>
                </div>

                <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                {/* Icons */}
                <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 block h-1.5 w-1.5 rounded-full ring-1 ring-white bg-red-500"></span>
                </button>

                <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors">
                    <HelpCircle size={20} />
                </button>

                {/* Profile Dropdown */}
                <button className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-100 hover:bg-gray-50 rounded-r-lg py-1 pr-2 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 border border-primary-200">
                        <User size={16} />
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-xs font-semibold text-gray-700">Admin User</p>
                        <p className="text-[10px] text-gray-500">admin@demo.com</p>
                    </div>
                </button>
            </div>
        </header>
    );
}
