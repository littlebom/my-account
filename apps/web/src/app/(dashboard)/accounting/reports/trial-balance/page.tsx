'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FileText, Printer } from 'lucide-react';

interface TrialBalanceLine {
    accountId: string;
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    netDebit: number;
    netCredit: number;
}

export default function TrialBalancePage() {
    const [data, setData] = useState<TrialBalanceLine[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await api.get<TrialBalanceLine[]>(`/reports/trial-balance?date=${date}`);
            setData(result);
        } catch (error) {
            console.error('Failed to fetch Trial Balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalDebit = data.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = data.reduce((sum, item) => sum + item.credit, 0);

    // Net Total for Verification (Should be 0 if balanced)
    // But usually TB shows Gross Debit/Credit totals matching.
    // The API returns netDebit/netCredit per account for display if needed, 
    // but standard TB often shows ending balances.
    // Let's summing up netDebit vs netCredit from the response
    const totalNetDebit = data.reduce((sum, item) => sum + item.netDebit, 0);
    const totalNetCredit = data.reduce((sum, item) => sum + item.netCredit, 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Trial Balance</h1>
                    <div className="flex items-center space-x-4">
                        <input
                            type="date"
                            className="border-gray-300 rounded-md border p-2 shadow-sm"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <Printer size={16} className="mr-2" />
                            Print
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="col-span-6">Account</div>
                            <div className="col-span-3 text-right">Debit</div>
                            <div className="col-span-3 text-right">Credit</div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {data.map((item) => (
                                <div key={item.accountId} className="px-4 py-4 sm:px-6 grid grid-cols-12 gap-4 hover:bg-gray-50">
                                    <div className="col-span-6 flex items-center">
                                        <span className="font-mono text-gray-500 mr-3">{item.accountCode}</span>
                                        <span className="font-medium text-gray-900">{item.accountName}</span>
                                    </div>
                                    <div className="col-span-3 text-right font-mono text-gray-900">
                                        {item.netDebit > 0 ? item.netDebit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </div>
                                    <div className="col-span-3 text-right font-mono text-gray-900">
                                        {item.netCredit > 0 ? item.netCredit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </div>
                                </div>
                            ))}

                            {data.length === 0 && (
                                <div className="px-4 py-8 text-center text-gray-500">No data available for this date.</div>
                            )}

                            {data.length > 0 && (
                                <div className="px-4 py-4 sm:px-6 grid grid-cols-12 gap-4 bg-gray-50 font-bold border-t-2 border-gray-300">
                                    <div className="col-span-6 text-right pr-4">Total</div>
                                    <div className={`col-span-3 text-right ${Math.abs(totalNetDebit - totalNetCredit) < 0.01 ? 'text-green-700' : 'text-red-700'}`}>
                                        {totalNetDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className={`col-span-3 text-right ${Math.abs(totalNetDebit - totalNetCredit) < 0.01 ? 'text-green-700' : 'text-red-700'}`}>
                                        {totalNetCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
