'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { X, Loader2, Save } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type: 'receipt' | 'payment'; // receipt = invoice, payment = bill
    documentId: string; // Invoice ID or Bill ID
    documentNumber: string;
    remainingAmount: number;
}

interface Account {
    id: string;
    accountCode: string;
    accountName: string;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, type, documentId, documentNumber, remainingAmount }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);

    // Form Data
    const [amount, setAmount] = useState(remainingAmount);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [bankAccountId, setBankAccountId] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount(remainingAmount);
            fetchAccounts();
        }
    }, [isOpen, remainingAmount]);

    const fetchAccounts = async () => {
        try {
            // Fetch all accounts and filter for Cash/Bank (assuming 111xx)
            const res = await api.get<Account[]>('/coa');
            const cashBankAccounts = res.filter(a => a.accountCode.startsWith('111'));
            setAccounts(cashBankAccounts);
            if (cashBankAccounts.length > 0) {
                setBankAccountId(cashBankAccounts[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = type === 'receipt' ? '/payments/receipt' : '/payments/pay';
            const payload = type === 'receipt' ? { invoiceId: documentId } : { billId: documentId };

            await api.post(endpoint, {
                ...payload,
                amount: Number(amount),
                paymentDate,
                paymentMethod,
                bankAccountId,
                notes
            });

            alert('บันทึกการชำระเงินเรียบร้อยแล้ว');
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(error.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-lg font-medium text-gray-900">
                        {type === 'receipt' ? 'รับชำระเงิน (Receive Payment)' : 'ชำระเงิน (Make Payment)'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-gray-50 p-3 rounded-md mb-4 text-sm">
                        <p className="text-gray-500">เอกสารอ้างอิง:</p>
                        <p className="font-semibold text-gray-900">{documentNumber}</p>
                        <p className="text-gray-500 mt-1">ยอดค้างชำระ:</p>
                        <p className="font-semibold text-primary-600">{remainingAmount.toLocaleString()} บาท</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">วันที่รายการ</label>
                        <input
                            type="date"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">บัญชีรับ/จ่ายเงิน</label>
                        <select
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={bankAccountId}
                            onChange={(e) => setBankAccountId(e.target.value)}
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.accountCode} - {acc.accountName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">วิธีการชำระเงิน</label>
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="cash">เงินสด (Cash)</option>
                            <option value="bank_transfer">โอนเงิน (Bank Transfer)</option>
                            <option value="check">เช็ค (Check)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">จำนวนเงิน</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">หมายเหตุ</label>
                        <textarea
                            rows={2}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                            ยืนยัน
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
