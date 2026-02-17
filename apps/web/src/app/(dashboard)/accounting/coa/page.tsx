'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ChevronRight, ChevronDown, Plus, Edit, Trash, Folder, FileText } from 'lucide-react';

interface ChartOfAccount {
    id: string;
    accountCode: string;
    accountName: string;
    accountType: string;
    level: number;
    parentId: string | null;
    children?: ChartOfAccount[];
}

export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await api.get<ChartOfAccount[]>('/coa/tree');
            setAccounts(data);
        } catch (error) {
            console.error('Failed to fetch CoA:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const renderTree = (nodes: ChartOfAccount[]) => {
        return nodes.map((node) => (
            <div key={node.id} className="ml-4">
                <div className="flex items-center py-2 hover:bg-gray-50 rounded px-2 group">
                    <button
                        onClick={() => toggleExpand(node.id)}
                        className="mr-2 text-gray-500 focus:outline-none"
                    >
                        {node.children && node.children.length > 0 ? (
                            expanded[node.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                        ) : (
                            <div className="w-4 h-4" />
                        )}
                    </button>

                    <div className="flex-1 flex items-center">
                        <span className="mr-2 text-gray-400">
                            {node.children && node.children.length > 0 ? <Folder size={16} /> : <FileText size={16} />}
                        </span>
                        <span className="text-sm font-medium text-gray-900 w-24">{node.accountCode}</span>
                        <span className="text-sm text-gray-700">{node.accountName}</span>
                        <span className="ml-4 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{node.accountType}</span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-primary-600" title="Add Sub-account">
                            <Plus size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
                            <Edit size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                            <Trash size={16} />
                        </button>
                    </div>
                </div>

                {expanded[node.id] && node.children && (
                    <div className="border-l border-gray-200 ml-2">
                        {renderTree(node.children)}
                    </div>
                )}
            </div>
        ));
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                        <Plus size={16} className="mr-2" />
                        New Account
                    </button>
                </div>

                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        {accounts.length > 0 ? (
                            renderTree(accounts)
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No accounts found. Start by creating a new one.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
