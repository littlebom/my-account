'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewVendorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form Data
    const [name, setName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [branchCode, setBranchCode] = useState('00000');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [contactPerson, setContactPerson] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/contacts', {
                type: 'vendor', // Explicitly specify vendor type
                name,
                taxId,
                branchCode,
                email,
                phone,
                address,
                contactPerson,
                paymentTerm: 30
            });
            router.push('/purchase/vendors');
        } catch (error: any) {
            alert(error.message || 'Failed to create vendor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/purchase/vendors" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">เพิ่มเจ้าหนี้ใหม่</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 space-y-6">
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท / ร้านค้า</label>
                                <Input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                                <Input
                                    type="text"
                                    value={taxId}
                                    onChange={(e) => setTaxId(e.target.value)}
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">สำนักงาน / สาขาที่</label>
                                <Input
                                    type="text"
                                    value={branchCode}
                                    onChange={(e) => setBranchCode(e.target.value)}
                                />
                            </div>

                            <div className="col-span-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                                <Textarea
                                    rows={3}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">ผู้ติดต่อ</label>
                                <Input
                                    type="text"
                                    value={contactPerson}
                                    onChange={(e) => setContactPerson(e.target.value)}
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                <Input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    บันทึก...
                                </>
                            ) : (
                                <>
                                    <Save className="-ml-1 mr-2 h-4 w-4" />
                                    บันทึก
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
