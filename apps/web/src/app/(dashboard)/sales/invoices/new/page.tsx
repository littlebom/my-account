'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppStore } from '@/stores/app-store';
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';

interface Customer {
    id: string;
    name: string;
    address: string;
    taxId: string;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

export default function NewInvoicePage() {
    const router = useRouter();
    const user = useAppStore((state) => state.user);

    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [documentDate, setDocumentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unitPrice: 0 }
    ]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get<Customer[]>('/contacts?type=customer');
            setCustomers(res);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    };

    const calculateVat = () => {
        return calculateSubtotal() * 0.07;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateVat();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId) return alert('กรุณาเลือกลูกค้า');
        if (items.some(i => !i.description || i.quantity <= 0 || i.unitPrice < 0)) {
            return alert('กรุณาระบุรายการสินค้าให้ถูกต้อง');
        }

        setLoading(true);
        try {
            await api.post('/invoices', {
                customerId,
                documentDate,
                dueDate,
                items: items.map(item => ({
                    ...item,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice)
                }))
            });
            router.push('/sales/invoices');
        } catch (error: any) {
            alert(error.message || 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    const selectedCustomer = customers.find(c => c.id === customerId);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/invoices" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">สร้างใบแจ้งหนี้ (New Invoice)</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Card */}
                    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            {/* Customer Selection */}
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">ลูกค้า (Customer)</label>
                                <Combobox
                                    options={customers.map(c => ({ label: c.name, value: c.id }))}
                                    value={customerId}
                                    onChange={(value) => setCustomerId(value)}
                                    placeholder="ค้นหาลูกค้า..."
                                    emptyText="ไม่พบลูกค้า"
                                />
                                {selectedCustomer && (
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p>{selectedCustomer.address}</p>
                                        <p>Tax ID: {selectedCustomer.taxId}</p>
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="sm:col-span-3 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">วันที่เอกสาร</label>
                                    <Input
                                        type="date"
                                        required
                                        value={documentDate}
                                        onChange={(e) => setDocumentDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">วันครบกำหนด</label>
                                    <Input
                                        type="date"
                                        required
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Card */}
                    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">รายการสินค้า/บริการ</h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <Plus size={16} className="mr-1" /> เพิ่มรายการ
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700">รายละเอียด</label>
                                        <Input
                                            type="text"
                                            required
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            placeholder="ค่าบริการ..."
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-medium text-gray-700">จำนวน</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            required
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-medium text-gray-700">ราคา/หน่วย</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-32 pt-6 text-right font-medium text-gray-900">
                                        {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString()}
                                    </div>
                                    <div className="pt-6">
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="mt-8 border-t border-gray-200 pt-8 flex justify-end">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>รวมเป็นเงิน (Subtotal)</span>
                                    <span>{calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                                    <span>{calculateVat().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
                                    <span>จำนวนเงินรวมทั้งสิ้น</span>
                                    <span>{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <Link
                            href="/sales/invoices"
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            ยกเลิก
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    บันทึก (Save Draft)
                                </>
                            ) : (
                                <>
                                    <Save className="-ml-1 mr-2 h-4 w-4" />
                                    บันทึกใบแจ้งหนี้
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
