"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Settings,
    ChevronDown,
    ChevronRight,
    Building2,
    Users
} from "lucide-react";

interface MenuItem {
    href?: string;
    label: string;
    icon: React.ReactNode;
    children?: { href: string; label: string }[];
}

const menuItems: MenuItem[] = [
    {
        href: "/dashboard",
        label: "แดชบอร์ด",
        icon: <LayoutDashboard size={20} />
    },
    {
        label: "บัญชี",
        icon: <BookOpen size={20} />,
        children: [
            { href: "/accounting/journals", label: "สมุดรายวัน" },
            { href: "/accounting/coa", label: "ผังบัญชี" },
        ]
    },
    {
        label: "รายงาน",
        icon: <FileText size={20} />,
        children: [
            { href: "/accounting/reports/trial-balance", label: "งบทดลอง" },
            { href: "/accounting/reports/general-ledger", label: "บัญชีแยกประเภท" },
        ]
    },
    {
        label: "ขาย",
        icon: <FileText size={20} />,
        children: [
            { href: "/sales/quotations", label: "ใบเสนอราคา" },
            { href: "/sales/invoices", label: "ใบแจ้งหนี้" },
            { href: "/sales/billing-notes", label: "ใบวางบิล" },
            { href: "/sales/receipts", label: "ใบเสร็จรับเงิน" },
            { href: "/sales/contacts", label: "ลูกค้า" },
        ]
    },
    {
        label: "ซื้อ/จ่าย",
        icon: <BookOpen size={20} />,
        children: [
            { href: "/purchase/vendors", label: "เจ้าหนี้" },
            { href: "/purchase/bills", label: "รายการจ่าย" },
        ]
    },
    {
        label: "ตั้งค่า",
        icon: <Settings size={20} />,
        children: [
            { href: "/settings/company", label: "ข้อมูลบริษัท" },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        "บัญชี": true,
        "ขาย": true,
        "ซื้อ/จ่าย": true,
        "รายงาน": true,
        "ตั้งค่า": false
    });

    const toggleExpand = (label: string) => {
        setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <aside className="w-64 bg-gray-50 text-gray-900 border-r border-gray-200 min-h-screen flex flex-col shadow-sm relative z-20">
            <div className="flex flex-col h-full bg-gray-50">
                {/* Logo */}
                <div className="p-4 border-b border-gray-200">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-md">
                            <span className="text-xl font-bold">CA</span>
                        </div>
                        <div>
                            <div className="font-bold text-lg text-gray-900">CloudAccount</div>
                            <div className="text-xs text-gray-500">ระบบบัญชีออนไลน์</div>
                        </div>
                    </Link>
                </div>

                {/* Company Selector */}
                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-gray-200 p-2 rounded-md shadow-sm">
                            <Building2 size={16} className="text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500">บริษัท</div>
                            <div className="font-medium truncate text-sm text-gray-900">บริษัท ตัวอย่าง จำกัด</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const isExpanded = expanded[item.label];
                            const isActive = item.href ? pathname === item.href : item.children?.some(child => pathname === child.href);

                            return (
                                <li key={item.label}>
                                    {item.href ? (
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${pathname === item.href
                                                ? "bg-primary-50 text-primary-700 font-medium border border-primary-100 shadow-sm"
                                                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            <span className={pathname === item.href ? "text-primary-600" : "text-gray-400"}>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    ) : (
                                        <div className="flex flex-col">
                                            <button
                                                onClick={() => toggleExpand(item.label)}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all w-full text-left ${isActive ? "text-gray-900 bg-gray-50" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={isActive ? "text-primary-600" : "text-gray-400"}>{item.icon}</span>
                                                    <span className="font-medium">{item.label}</span>
                                                </div>
                                                {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                                            </button>

                                            {isExpanded && item.children && (
                                                <ul className="ml-9 mt-1 space-y-1 border-l border-gray-200 pl-2">
                                                    {item.children.map((child) => {
                                                        const isChildActive = pathname === child.href;
                                                        return (
                                                            <li key={child.href}>
                                                                <Link
                                                                    href={child.href}
                                                                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${isChildActive
                                                                        ? "text-primary-700 bg-primary-50 font-medium"
                                                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                                                        }`}
                                                                >
                                                                    {child.label}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                            <Users size={16} className="text-primary-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-sm text-gray-900">ผู้ใช้งาน</div>
                            <div className="text-xs text-gray-500">Admin</div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
