'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Printer, ArrowLeft, Loader2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import PaymentModal from '@/components/accounting/payment-modal';

interface Bill {
    id: string;
    documentNumber: string;
    documentDate: string;
    dueDate: string;
    vendor: {
        name: string;
        address: string;
        taxId: string;
    };
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        amount: number;
    }[];
    subtotal: number;
    vatAmount: number;
    totalAmount: number;
    paidAmount: number;
    status: string;
}

export default function BillDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [bill, setBill] = useState<Bill | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchBill(params.id as string);
        }
    }, [params.id]);

    const fetchBill = async (id: string) => {
        try {
            const data = await api.get<Bill>(`/bills/${id}`);
            setBill(data);
        } catch (error) {
            console.error('Failed to fetch bill:', error);
            alert('ไม่พบเอกสาร');
            router.push('/purchase/bills');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!bill) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">

                {/* Actions Bar */}
                <div className="mb-6 flex items-center justify-between print:hidden">
                    <div className="flex items-center space-x-4">
                        <Link href="/purchase/bills" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">รายละเอียดใบวางบิล/ค่าใช้จ่าย</h1>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                                bill.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {bill.status === 'paid' ? 'ชำระแล้ว' : bill.status === 'approved' ? 'อนุมัติแล้ว' : bill.status}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {bill.status === 'approved' && bill.paidAmount < bill.totalAmount && (
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <CreditCard size={16} className="mr-2" />
                                ชำระเงิน
                            </button>
                        )}
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <Printer size={16} className="mr-2" />
                            พิมพ์
                        </button>
                    </div>
                </div>

                {/* Bill Paper */}
                <div className="bg-white shadow-lg p-8 sm:rounded-lg print:shadow-none print:p-0">
                    <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{bill.vendor.name}</h2>
                            <p className="text-sm text-gray-500 w-64">{bill.vendor.address}</p>
                            <p className="text-sm text-gray-500 mt-1">TAX ID: {bill.vendor.taxId}</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-3xl font-bold text-gray-700 mb-2">ใบแจ้งหนี้ / ใบวางบิล</h1>
                            <div className="text-sm text-gray-600">
                                <div className="flex justify-between gap-4 mb-1">
                                    <span className="font-semibold text-gray-900">เลขที่เอกสาร:</span>
                                    <span>{bill.documentNumber}</span>
                                </div>
                                <div className="flex justify-between gap-4 mb-1">
                                    <span className="font-semibold text-gray-900">วันที่:</span>
                                    <span>{format(new Date(bill.documentDate), 'dd/MM/yyyy')}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="font-semibold text-gray-900">ครบกำหนด:</span>
                                    <span>{format(new Date(bill.dueDate), 'dd/MM/yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 text-sm font-semibold text-gray-900">รายการ</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-900 w-24">จำนวน</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-900 w-32">ราคา/หน่วย</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-900 w-32">จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {bill.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 text-sm text-gray-900">{item.description}</td>
                                    <td className="py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                                    <td className="py-4 text-sm text-gray-900 text-right">
                                        {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-4 text-sm font-medium text-gray-900 text-right">
                                        {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end border-t border-gray-200 pt-8">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-500">รวมเป็นเงิน</span>
                                <span className="font-medium text-gray-900">{bill.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-500">ภาษีมูลค่าเพิ่ม (7%)</span>
                                <span className="font-medium text-gray-900">{bill.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
                                <span className="font-bold text-gray-900 text-base">จำนวนเงินรวมทั้งสิ้น</span>
                                <span className="font-bold text-primary-600 text-lg">{bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            {bill.paidAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 pt-2 border-t border-gray-200">
                                    <span className="font-medium">ชำระแล้ว</span>
                                    <span className="font-medium">-{bill.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {bill && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={() => fetchBill(bill.id)}
                    type="payment"
                    documentId={bill.id}
                    documentNumber={bill.documentNumber}
                    remainingAmount={bill.totalAmount - bill.paidAmount}
                />
            )}
        </div>
    );
}
