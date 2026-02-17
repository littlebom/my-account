'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Printer, ArrowLeft, Loader2, CreditCard, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import PaymentModal from '@/components/accounting/payment-modal';

interface Invoice {
    id: string;
    documentNumber: string;
    documentDate: string;
    dueDate: string;
    paidAmount: number;
    status: string;
    customer: {
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
}

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchInvoice(params.id as string);
        }
    }, [params.id]);

    const fetchInvoice = async (id: string) => {
        try {
            const data = await api.get<Invoice>(`/invoices/${id}`);
            setInvoice(data);
        } catch (error) {
            console.error('Failed to fetch invoice:', error);
            alert('ไม่พบเอกสาร');
            router.push('/sales/invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm('ยืนยันการอนุมัติใบแจ้งหนี้? เมื่ออนุมัติแล้วจะไม่สามารถแก้ไขได้')) return;

        try {
            setLoading(true);
            await api.patch(`/invoices/${params.id}/approve`);
            await fetchInvoice(params.id as string);
        } catch (error: any) {
            console.error('Failed to approve invoice:', error);
            alert(error.message || 'Failed to approve invoice');
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!invoice) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">

                {/* Actions Bar (Hidden on Print) */}
                <div className="mb-6 flex items-center justify-between print:hidden">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/invoices" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">รายละเอียดใบแจ้งหนี้</h1>
                        {/* Status Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {invoice.status === 'paid' ? 'ชำระแล้ว' : invoice.status === 'approved' ? 'อนุมัติแล้ว' : invoice.status}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {invoice.status === 'draft' && (
                            <button
                                onClick={handleApprove}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <CheckCircle size={16} className="mr-2" />
                                อนุมัติ (Approve)
                            </button>
                        )}
                        {invoice.status === 'approved' && invoice.paidAmount < invoice.totalAmount && (
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <CreditCard size={16} className="mr-2" />
                                รับชำระเงิน
                            </button>
                        )}
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <Printer size={16} className="mr-2" />
                            พิมพ์ / PDF
                        </button>
                    </div>
                </div>

                {/* A4 Paper Container */}
                <div className="bg-white shadow-lg p-8 sm:rounded-lg print:shadow-none print:p-0">

                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-primary-900 rounded-lg flex items-center justify-center text-white font-bold text-xl print:bg-black">
                                    CA
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">บริษัท ตัวอย่าง จำกัด</h2>
                            </div>
                            <p className="text-sm text-gray-500 w-64">
                                123 อาคารสาทรซิตี้ ทาวเวอร์ ชั้น 10 ถนนสาทรใต้ แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                โทร: 02-123-4567 | เลขประจำตัวผู้เสียภาษี: 0105555555555
                            </p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-3xl font-bold text-primary-600 mb-2 print:text-black">ใบแจ้งหนี้</h1>
                            <h3 className="text-lg font-medium text-gray-500 uppercase tracking-widest mb-4">Invoice</h3>
                            <div className="text-sm text-gray-600">
                                <div className="flex justify-between gap-4 mb-1">
                                    <span className="font-semibold text-gray-900">เลขที่:</span>
                                    <span>{invoice.documentNumber}</span>
                                </div>
                                <div className="flex justify-between gap-4 mb-1">
                                    <span className="font-semibold text-gray-900">วันที่:</span>
                                    <span>{format(new Date(invoice.documentDate), 'dd/MM/yyyy')}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="font-semibold text-gray-900">ครบกำหนด:</span>
                                    <span>{format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">ลูกค้า (Bill To)</h3>
                        <div className="text-sm text-gray-600">
                            <p className="font-bold text-gray-900 text-lg mb-1">{invoice.customer.name}</p>
                            <p className="w-64 mb-1">{invoice.customer.address}</p>
                            <p>เลขประจำตัวผู้เสียภาษี: {invoice.customer.taxId}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-primary-600 print:border-black">
                                <th className="text-left py-3 text-sm font-semibold text-gray-900 w-12">#</th>
                                <th className="text-left py-3 text-sm font-semibold text-gray-900">รายการ (Description)</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-900 w-24">จำนวน</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-900 w-32">ราคา/หน่วย</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-900 w-32">จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoice.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 text-sm text-gray-500 align-top">{index + 1}</td>
                                    <td className="py-4 text-sm text-gray-900 align-top">{item.description}</td>
                                    <td className="py-4 text-sm text-gray-900 text-right align-top">{item.quantity}</td>
                                    <td className="py-4 text-sm text-gray-900 text-right align-top">
                                        {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-4 text-sm font-medium text-gray-900 text-right align-top">
                                        {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end border-t border-gray-200 pt-8">
                        <div className="w-64">
                            <div className="flex justify-between py-2 text-sm">
                                <span className="font-medium text-gray-500">รวมเป็นเงิน</span>
                                <span className="font-medium text-gray-900">{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm">
                                <span className="font-medium text-gray-500">ภาษีมูลค่าเพิ่ม (7%)</span>
                                <span className="font-medium text-gray-900">{invoice.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
                                <span className="font-bold text-gray-900 text-base">จำนวนเงินรวมทั้งสิ้น</span>
                                <span className="font-bold text-primary-600 text-lg print:text-black">{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="mt-16 grid grid-cols-2 gap-8 pt-8 avoid-break">
                        <div className="text-center">
                            <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">ผู้รับวางบิล / ผู้รับสินค้า</p>
                            <p className="text-xs text-gray-400 mt-1">วันที่: ______/______/______</p>
                        </div>
                        <div className="text-center">
                            <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">ผู้มีอำนาจลงนาม</p>
                            <p className="text-xs text-gray-400 mt-1">วันที่: ______/______/______</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Payment Modal */}
            {invoice && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={() => fetchInvoice(invoice.id)}
                    type="receipt"
                    documentId={invoice.id}
                    documentNumber={invoice.documentNumber}
                    remainingAmount={invoice.totalAmount - invoice.paidAmount}
                />
            )}
        </div>
    );
}
