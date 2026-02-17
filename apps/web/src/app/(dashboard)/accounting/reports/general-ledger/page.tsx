'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Printer, Search } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';

interface Account {
    id: string;
    accountCode: string;
    accountName: string;
}

interface GLLine {
    id: string;
    date: string;
    documentNumber: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
}

export default function GeneralLedgerPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<GLLine[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const result = await api.get<Account[]>('/coa'); // Flat list is better for dropdown
            setAccounts(result.sort((a, b) => a.accountCode.localeCompare(b.accountCode)));
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        }
    };

    useEffect(() => {
        if (selectedAccountId) {
            fetchGLData();
        } else {
            setData([]);
        }
    }, [selectedAccountId, startDate, endDate]);

    const fetchGLData = async () => {
        try {
            setLoading(true);
            const result = await api.get<GLLine[]>(
                `/reports/general-ledger?accountId=${selectedAccountId}&startDate=${startDate}&endDate=${endDate}`
            );
            setData(result);
        } catch (error) {
            console.error('Failed to fetch GL Data:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalDebit = data.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = data.reduce((sum, item) => sum + item.credit, 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">General Ledger</h1>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Printer size={16} className="mr-2" />
                        Print
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Account</label>
                            <Combobox
                                options={accounts.map(acc => ({ label: `${acc.accountCode} - ${acc.accountName}`, value: acc.id }))}
                                value={selectedAccountId}
                                onChange={(value) => setSelectedAccountId(value)}
                                placeholder="Select Account"
                                emptyText="No account found"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Report Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading...</div>
                    ) : !selectedAccountId ? (
                        <div className="p-12 text-center text-gray-500">Please select an account to view details.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc No.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Description</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                                                {item.documentNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                                                {item.debit > 0 ? item.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                                                {item.credit > 0 ? item.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono font-bold">
                                                {item.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions found for this period.</td></tr>
                                    )}
                                    {data.length > 0 && (
                                        <tr className="bg-gray-50 font-bold">
                                            <td colSpan={3} className="px-6 py-4 text-right">Period Total</td>
                                            <td className="px-6 py-4 text-right">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-right">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
