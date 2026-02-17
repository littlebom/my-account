'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Plus, Search, FileText, MoreHorizontal, Printer } from 'lucide-react';
import { format } from 'date-fns';

interface BillingNote {
    id: string;
    documentNumber: string;
    documentDate: string;
    dueDate: string;
    totalAmount: number;
    status: string;
    customer: {
        name: string;
        code: string;
    };
    _count: {
        items: number;
    };
}

export default function BillingNotesPage() {
    const [billingNotes, setBillingNotes] = useState<BillingNote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBillingNotes();
    }, []);

    const fetchBillingNotes = async () => {
        try {
            const data = await api.get<BillingNote[]>('/billing-notes');
            setBillingNotes(data);
        } catch (error) {
            console.error('Failed to fetch billing notes', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">ใบวางบิล (Billing Notes)</h1>
                    <Link
                        href="/sales/billing-notes/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                        <Plus size={16} className="mr-2" />
                        สร้างใบวางบิล
                    </Link>
                </div>

                {/* Filters (Mock) */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="ค้นหาเลขที่เอกสาร, ลูกค้า..."
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            Loading...
                        </div>
                    ) : billingNotes.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            ยังไม่มีใบวางบิล
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        เลขที่เอกสาร
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ลูกค้า
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        วันที่
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        วันครบกำหนด
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ยอดรวม
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        สถานะ
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {billingNotes.map((bn) => (
                                    <tr key={bn.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FileText className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                                                <div className="text-sm font-medium text-primary-600">
                                                    {bn.documentNumber}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 ml-8">
                                                {bn._count.items} รายการ
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{bn.customer.name}</div>
                                            <div className="text-xs text-gray-500">{bn.customer.code}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(bn.documentDate), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(bn.dueDate), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            {Number(bn.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                {bn.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
