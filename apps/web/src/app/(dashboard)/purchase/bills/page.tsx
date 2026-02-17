'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Plus, Search, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Bill {
    id: string;
    documentNumber: string;
    documentDate: string;
    vendor: { name: string };
    totalAmount: number;
    status: string;
}

export default function BillsPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const result = await api.get<Bill[]>('/bills');
            setBills(result);
        } catch (error) {
            console.error('Failed to fetch bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center w-fit gap-1"><CheckCircle size={12} /> Approved</span>;
            case 'draft':
                return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 flex items-center w-fit gap-1"><Clock size={12} /> Draft</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const filteredBills = bills.filter((bill) =>
        bill.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ใบรับวางบิล/ค่าใช้จ่าย (Bills)</h1>
                        <p className="text-sm text-gray-500">จัดการรายจ่ายและเจ้าหนี้</p>
                    </div>
                    <Link
                        href="/purchase/bills/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <Plus size={16} className="mr-2" />
                        สร้างรายการจ่าย
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหา (เลขที่, เจ้าหนี้)"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
                    ) : filteredBills.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">ไม่พบรายการ</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่เอกสาร</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เจ้าหนี้</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/purchase/bills/${bill.id}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(bill.documentDate), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                                            {bill.documentNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {bill.vendor.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(bill.totalAmount))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getStatusBadge(bill.status)}
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
