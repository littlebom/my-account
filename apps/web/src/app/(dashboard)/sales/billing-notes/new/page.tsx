'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format, addDays } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Customer {
    id: string;
    name: string;
    code: string;
    address: string;
    creditTerm: number;
}

interface Invoice {
    id: string;
    documentNumber: string;
    documentDate: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number; // calculated in backend or here
}

export default function NewBillingNotePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerId, setCustomerId] = useState('');
    const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]); // Default to today, or +credit term
    const [notes, setNotes] = useState('');

    // Invoice Selection State
    const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (customerId) {
            const customer = customers.find(c => c.id === customerId);
            if (customer) {
                // Set due date based on credit term
                const nextDueDate = addDays(new Date(documentDate), customer.creditTerm || 30);
                setDueDate(nextDueDate.toISOString().split('T')[0]);

                // Fetch unpaid invoices
                fetchUnpaidInvoices(customerId);
            }
        } else {
            setUnpaidInvoices([]);
            setSelectedInvoiceIds(new Set());
        }
    }, [customerId]);

    const fetchCustomers = async () => {
        try {
            const data = await api.get<Customer[]>('/contacts?type=customer');
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    };

    const fetchUnpaidInvoices = async (custId: string) => {
        try {
            setIsLoadingInvoices(true);
            const data = await api.get<Invoice[]>(`/billing-notes/unpaid-invoices?customerId=${custId}`);
            setUnpaidInvoices(data);
            // By default select none or all? Let's select none.
            setSelectedInvoiceIds(new Set());
        } catch (error) {
            console.error('Failed to fetch unpaid invoices', error);
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    const toggleInvoice = (id: string) => {
        const newSet = new Set(selectedInvoiceIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedInvoiceIds(newSet);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerId) return alert('กรุณาเลือกลูกค้า');
        if (selectedInvoiceIds.size === 0) return alert('กรุณาเลือกเอกสารอย่างน้อย 1 รายการ');

        try {
            setSubmitting(true);
            await api.post('/billing-notes', {
                customerId,
                documentDate,
                dueDate,
                notes,
                items: Array.from(selectedInvoiceIds).map(id => ({ invoiceId: id }))
            });
            router.push('/sales/billing-notes');
        } catch (error: any) {
            alert(error.message || 'Failed to create billing note');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate totals
    const selectedInvoices = unpaidInvoices.filter(inv => selectedInvoiceIds.has(inv.id));
    const totalAmount = selectedInvoices.reduce((sum, inv) => sum + Number(inv.outstandingAmount), 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/sales/billing-notes" className="mr-4 text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">สร้างใบวางบิล</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Info */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ลูกค้า</label>
                                <Combobox
                                    options={customers.map(c => ({ label: c.name, value: c.id }))}
                                    value={customerId}
                                    onChange={(value) => setCustomerId(value)}
                                    placeholder="ค้นหาลูกค้า..."
                                    emptyText="ไม่พบลูกค้า"
                                />
                                {customerId && (
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p>{customers.find(c => c.id === customerId)?.address}</p>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เอกสาร</label>
                                    <Input
                                        type="date"
                                        value={documentDate}
                                        onChange={(e) => setDocumentDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">วันครบกำหนด</label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoices Selection */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">รายการใบแจ้งหนี้ที่ค้างชำระ</h3>
                            <span className="text-sm text-gray-500">เลือกรายการที่ต้องการวางบิล</span>
                        </div>

                        {isLoadingInvoices ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="animate-spin text-primary-600" />
                            </div>
                        ) : !customerId ? (
                            <div className="p-12 text-center text-gray-500">
                                กรุณาเลือกลูกค้าเพื่อแสดงรายการ
                            </div>
                        ) : unpaidInvoices.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                ไม่พบรายการค้างชำระ
                            </div>
                        ) : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedInvoiceIds(new Set(unpaidInvoices.map(i => i.id)));
                                                        } else {
                                                            setSelectedInvoiceIds(new Set());
                                                        }
                                                    }}
                                                    checked={selectedInvoiceIds.size === unpaidInvoices.length && unpaidInvoices.length > 0}
                                                />
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                เลขที่เอกสาร
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                วันที่
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ครบกำหนด
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ยอดคงเหลือ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {unpaidInvoices.map((inv) => (
                                            <tr
                                                key={inv.id}
                                                className={`hover:bg-gray-50 cursor-pointer ${selectedInvoiceIds.has(inv.id) ? 'bg-blue-50' : ''}`}
                                                onClick={() => toggleInvoice(inv.id)}
                                            >
                                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                        checked={selectedInvoiceIds.has(inv.id)}
                                                        onChange={() => toggleInvoice(inv.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {inv.documentNumber}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(inv.documentDate), 'dd/MM/yyyy')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(inv.dueDate), 'dd/MM/yyyy')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                    {Number(inv.outstandingAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                    <div className="flex justify-end items-center gap-4">
                                        <span className="text-sm font-medium text-gray-700">รายการที่เลือก: {selectedInvoiceIds.size} รายการ</span>
                                        <span className="text-lg font-bold text-primary-700">ยอดรวม: ฿{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                        <Textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link
                            href="/sales/billing-notes"
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            ยกเลิก
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || selectedInvoiceIds.size === 0}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                <>
                                    <Save className="-ml-1 mr-2 h-4 w-4" />
                                    บันทึกใบวางบิล
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
