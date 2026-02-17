'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Combobox } from '@/components/ui/combobox';

interface Account {
    id: string;
    accountCode: string;
    accountName: string;
}

interface JournalLine {
    id: number;
    accountId: string;
    description: string;
    debitAmount: string; // Use string for input handling
    creditAmount: string;
}

export default function NewJournalEntryPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [lines, setLines] = useState<JournalLine[]>([
        { id: 1, accountId: '', description: '', debitAmount: '', creditAmount: '' },
        { id: 2, accountId: '', description: '', debitAmount: '', creditAmount: '' },
    ]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await api.get<Account[]>('/coa'); // Flat list
            setAccounts(data);
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        } finally {
            setLoading(false);
        }
    };

    const addLine = () => {
        setLines([
            ...lines,
            { id: Date.now(), accountId: '', description: '', debitAmount: '', creditAmount: '' },
        ]);
    };

    const removeLine = (id: number) => {
        if (lines.length > 2) {
            setLines(lines.filter((line) => line.id !== id));
        }
    };

    const updateLine = (id: number, field: keyof JournalLine, value: string) => {
        setLines(
            lines.map((line) => {
                if (line.id === id) {
                    // If Debit is entered, clear Credit, and vice versa (optional UX, but standard in some systems)
                    // For now, let's allow both but valid logic usually implies one.
                    // Let's not enforce auto-clear for flexibility, just validation at the end.
                    return { ...line, [field]: value };
                }
                return line;
            })
        );
    };

    const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debitAmount) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.creditAmount) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isBalanced) {
            alert('Journal Entry is not balanced!');
            return;
        }

        // Validate accounts selected
        if (lines.some(l => !l.accountId)) {
            alert('Please select an account for all lines.');
            return;
        }

        try {
            setSaving(true);
            await api.post('/journals', {
                date,
                description,
                lines: lines.map((l) => ({
                    accountId: l.accountId,
                    description: l.description,
                    debitAmount: parseFloat(l.debitAmount) || 0,
                    creditAmount: parseFloat(l.creditAmount) || 0,
                })),
            });
            router.push('/accounting/journals');
        } catch (error: any) {
            alert(error.message || 'Failed to save journal entry');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading accounts...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/accounting/journals" className="mr-4 text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">New Journal Entry</h1>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!isBalanced || saving}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isBalanced ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Save size={16} className="mr-2" />
                        {saving ? 'Saving...' : 'Save Journal'}
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Opening Balance"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/3">Account</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Debit</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Credit</th>
                                <th className="px-4 py-3 text-center w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {lines.map((line, index) => (
                                <tr key={line.id}>
                                    <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-2">
                                        <Combobox
                                            options={accounts.map(acc => ({ label: `${acc.accountCode} - ${acc.accountName}`, value: acc.id }))}
                                            value={line.accountId}
                                            onChange={(value) => updateLine(line.id, 'accountId', value)}
                                            placeholder="Select Account"
                                            emptyText="No account found"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-1"
                                            value={line.description}
                                            onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                                            placeholder={description} // Default to header desc hint
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-1 text-right"
                                            value={line.debitAmount}
                                            onChange={(e) => updateLine(line.id, 'debitAmount', e.target.value)}
                                        // onFocus={() => updateLine(line.id, 'creditAmount', '')} // Optional auto-clear
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-1 text-right"
                                            value={line.creditAmount}
                                            onChange={(e) => updateLine(line.id, 'creditAmount', e.target.value)}
                                        // onFocus={() => updateLine(line.id, 'debitAmount', '')} // Optional auto-clear
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            onClick={() => removeLine(line.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Remove Line"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold">
                            <tr>
                                <td colSpan={3} className="px-4 py-3 text-right text-sm text-gray-900">Total</td>
                                <td className={`px-4 py-3 text-right text-sm ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className={`px-4 py-3 text-right text-sm ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                        <button
                            onClick={addLine}
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                            <Plus size={16} className="mr-2" />
                            Add Line
                        </button>
                    </div>
                </div>

                {!isBalanced && (
                    <div className="rounded-md bg-red-50 p-4 mt-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                {/* Error Icon */}
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Entry is not balanced</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>Total Debit ({totalDebit.toFixed(2)}) must equal Total Credit ({totalCredit.toFixed(2)}). Difference: {Math.abs(totalDebit - totalCredit).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
