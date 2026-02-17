"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";
import { api } from "@/lib/api";

interface Receipt {
    id: string;
    documentNumber: string;
    paymentDate: string;
    amount: number;
    paymentMethod: string;
    status: string;
    invoice: {
        documentNumber: string;
        customer: {
            name: string;
        };
    };
}

export default function ReceiptListPage() {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            // Fetch only 'receive' type payments
            const data = await api.get<Receipt[]>("/payments?type=receive");
            setReceipts(data);
        } catch (error) {
            console.error("Failed to fetch receipts:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReceipts = receipts.filter((receipt) =>
        receipt.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
        receipt.invoice.customer.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ใบเสร็จรับเงิน (Receipts)</h1>
                    <p className="text-gray-500">จัดการประวัติการรับชำระเงินจากลูกค้า</p>
                </div>
                {/* Receipt is usually created from Invoice -> Receive Payment, but maybe direct receipt creation is needed? 
                     For now, we'll guide user to Invoice page */}
                <Link href="/sales/invoices" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm transition-colors text-sm font-medium">
                    <Plus size={16} className="mr-2" />
                    รับชำระเงินใหม่
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -trangray-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาเลขที่เอกสาร หรือ ชื่อลูกค้า..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่เอกสาร</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชำระค่า</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิธีชำระ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        กำลังโหลดข้อมูล...
                                    </td>
                                </tr>
                            ) : filteredReceipts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        ไม่พบรายการใบเสร็จรับเงิน
                                    </td>
                                </tr>
                            ) : (
                                filteredReceipts.map((receipt) => (
                                    <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(receipt.paymentDate).toLocaleDateString("th-TH")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                                            <Link href={`/sales/receipts/${receipt.id}`} className="hover:underline">
                                                {receipt.documentNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {receipt.invoice.customer.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {receipt.invoice.documentNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                            {receipt.paymentMethod.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                            {receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                สมบูรณ์
                                            </span>
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
