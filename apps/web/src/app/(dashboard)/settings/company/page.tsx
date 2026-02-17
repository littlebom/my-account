'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/stores/app-store';

interface TenantProfile {
    name: string;
    taxId: string;
    address: string;
    phone: string;
    email: string;
    baseCurrency: string;
}

interface Branch {
    id: string;
    code: string;
    name: string;
    address: string;
    isHeadquarter: boolean;
}

export default function TenantSettingsPage() {
    const [profile, setProfile] = useState<TenantProfile>({
        name: '',
        taxId: '',
        address: '',
        phone: '',
        email: '',
        baseCurrency: 'THB',
    });
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileData, branchesData] = await Promise.all([
                api.get<TenantProfile>('/tenants/profile'),
                api.get<Branch[]>('/branches'),
            ]);
            setProfile(profileData);
            setBranches(branchesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch('/tenants/profile', profile);
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const [newBranch, setNewBranch] = useState({ code: '', name: '', address: '' });

    const handleAddBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/branches', newBranch);
            setNewBranch({ code: '', name: '', address: '' });
            fetchData(); // Refresh list
        } catch (error) {
            alert('Failed to add branch.');
        }
    };

    const handleDeleteBranch = async (id: string) => {
        if (!confirm('Are you sure you want to delete this branch?')) return;
        try {
            await api.delete(`/branches/${id}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete branch.');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Company Settings</h1>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Company Profile Section */}
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Company Profile</h3>
                            <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                        value={profile.taxId || ''}
                                        onChange={(e) => setProfile({ ...profile, taxId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                        value={profile.address || ''}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                            value={profile.phone || ''}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                            value={profile.email || ''}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    >
                                        {saving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Branches Section */}
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Branches</h3>

                            {/* Add Branch Form */}
                            <form onSubmit={handleAddBranch} className="mt-5 mb-8 bg-gray-50 p-4 rounded-md">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Branch</h4>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Code (e.g. 00001)"
                                            required
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                            value={newBranch.code}
                                            onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Branch Name"
                                            required
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                            value={newBranch.name}
                                            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        Add Branch
                                    </button>
                                </div>
                            </form>

                            {/* Branches List */}
                            <div className="mt-4 flex flex-col">
                                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead>
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Code</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {branches.map((branch) => (
                                                    <tr key={branch.id}>
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{branch.code}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{branch.name} {branch.isHeadquarter && '(HQ)'}</td>
                                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                            {!branch.isHeadquarter && (
                                                                <button
                                                                    onClick={() => handleDeleteBranch(branch.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
