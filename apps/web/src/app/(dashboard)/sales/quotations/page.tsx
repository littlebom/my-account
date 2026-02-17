"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    FileText,
    Filter,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    FileEdit
} from "lucide-react";
import { api } from "@/lib/api";

interface Quotation {
    id: string;
    documentNumber: string;
    documentDate: string;
    totalAmount: number;
    status: string;
    customer: {
        name: string;
    };
}

export default function QuotationListPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const data = await api.get<Quotation[]>("/quotations");
            setQuotations(data);
        } catch (error) {
            console.error("Failed to fetch quotations:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotations = quotations.filter((q) =>
        q.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
        q.customer.name.toLowerCase().includes(search.toLowerCase())
    );

    // Stats Calculation
    const totalQuotations = quotations.length;
    const totalValue = quotations.reduce((sum, q) => sum + Number(q.totalAmount), 0);
    const pendingCount = quotations.filter(q => ['draft', 'sent'].includes(q.status)).length;
    const acceptedCount = quotations.filter(q => q.status === 'accepted' || q.status === 'invoiced').length;

    const getStatusBadge = (status: string) => {
        const styles = {
            draft: "bg-gray-100 text-gray-700 border-gray-200",
            sent: "bg-blue-50 text-blue-700 border-blue-200",
            accepted: "bg-green-50 text-green-700 border-green-200",
            rejected: "bg-red-50 text-red-700 border-red-200",
            invoiced: "bg-purple-50 text-purple-700 border-purple-200",
        };

        const labels = {
            draft: "ร่างเอกสาร",
            sent: "ส่งแล้ว",
            accepted: "ตอบรับแล้ว",
            rejected: "ปฏิเสธ",
            invoiced: "ออกใบแจ้งหนี้แล้ว",
        };

        const key = status as keyof typeof styles;
        return (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[key] || styles.draft}`}>
                {labels[key] || status}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ใบเสนอราคา (Quotations)</h1>
                    <p className="text-gray-500 mt-1">จัดการและติดตามสถานะใบเสนอราคาของคุณ</p>
                </div>
                <Link href="/sales/quotations/new" className="inline-flex items-center px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm shadow-primary-600/20 transition-all text-sm font-medium hover:-translate-y-0.5">
                    <Plus size={18} className="mr-2" />
                    สร้างใบเสนอราคา
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">ใบเสนอราคาทั้งหมด</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalQuotations}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">มูลค่ารวม</p>
                        <h3 className="text-2xl font-bold text-gray-900">฿{totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">รอดำเนินการ</p>
                        <h3 className="text-2xl font-bold text-gray-900">{pendingCount}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">สำเร็จแล้ว</p>
                        <h3 className="text-2xl font-bold text-gray-900">{acceptedCount}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -trangray-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหา..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium placeholder:font-normal"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                            <Filter size={16} className="mr-2" />
                            ตัวกรอง
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">เอกสาร</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ลูกค้า</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">วันที่</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">ยอดรวม</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16 ml-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-20 mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <FileText size={48} className="mb-4 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-900">ไม่พบใบเสนอราคา</p>
                                            <p className="text-sm">ลองค้นหาด้วยคำสำคัญอื่น หรือสร้างใบเสนอราคาใหม่</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotations.map((q) => (
                                    <tr key={q.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/sales/quotations/${q.documentNumber}`} className="flex flex-col group-hover:translate-x-1 transition-transform">
                                                <span className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                                                    {q.documentNumber}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">{q.customer.name}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span className="font-medium">{new Date(q.documentDate).toLocaleDateString("th-TH")}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-gray-900">
                                                {q.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getStatusBadge(q.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/sales/quotations/${q.documentNumber}`} className="text-gray-400 hover:text-primary-600 transition-colors bg-white hover:bg-primary-50 p-2 rounded-lg inline-flex">
                                                <FileEdit size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
