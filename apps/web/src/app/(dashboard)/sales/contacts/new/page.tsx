'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewContactPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        taxId: '',
        phone: '',
        email: '',
        address: '',
        contactPerson: '',
        creditTerm: 30
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('กรุณาระบุชื่อลูกค้า');
            return;
        }

        try {
            setLoading(true);
            await api.post('/contacts', { ...formData, type: 'customer' });
            alert('บันทึกข้อมูลเรียบร้อยแล้ว');
            router.push('/sales/contacts');
        } catch (error) {
            console.error('Failed to save contact:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/sales/contacts" className="p-2 rounded-full hover:bg-white/50 text-gray-500 transition-colors">
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">เพิ่มลูกค้าใหม่</h1>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท / ชื่อลูกค้า <span className="text-red-500">*</span></label>
                            <Input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลขผู้เสียภาษี (Tax ID)</label>
                            <Input
                                type="text"
                                name="taxId"
                                value={formData.taxId}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ติดต่อ</label>
                            <Input
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                            <Input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                            <Textarea
                                name="address"
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เครดิตเทอม (วัน)</label>
                            <Input
                                type="number"
                                name="creditTerm"
                                value={formData.creditTerm}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-5 border-t border-gray-200">
                        <div className="flex justify-end">
                            <Link
                                href="/sales/contacts"
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                ยกเลิก
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                <Save size={16} className="mr-2" />
                                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
