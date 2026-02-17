"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditContactPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        taxId: "",
        phone: "",
        email: "",
        address: "",
        contactPerson: "",
        creditTerm: 30,
        code: "" // Readonly usually
    });

    useEffect(() => {
        if (params.id) {
            fetchContact(params.id as string);
        }
    }, [params.id]);

    const fetchContact = async (id: string) => {
        try {
            setFetching(true);
            const data = await api.get<any>(`/contacts/${id}?type=customer`);
            setFormData({
                name: data.name || "",
                taxId: data.taxId || "",
                phone: data.phone || "",
                email: data.email || "",
                address: data.address || "",
                contactPerson: data.contactPerson || "",
                creditTerm: data.creditTerm || 30,
                code: data.code || ""
            });
        } catch (error) {
            console.error("Failed to fetch contact:", error);
            alert("ไม่พบข้อมูลลูกค้า");
            router.push("/sales/contacts");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert("กรุณาระบุชื่อลูกค้า");
            return;
        }

        try {
            setLoading(true);
            await api.put(`/contacts/${params.id}`, { ...formData, type: "customer" });
            alert("บันทึกการแก้ไขเรียบร้อยแล้ว");
            router.push("/sales/contacts");
        } catch (error) {
            console.error("Failed to update contact:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (fetching) return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/sales/contacts" className="p-2 rounded-full hover:bg-white text-gray-500 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลลูกค้า</h1>
                    <p className="text-gray-500">{formData.code} - {formData.name}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-6">
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

                <div className="pt-5 border-t border-gray-200 flex justify-end gap-3">
                    <Link
                        href="/sales/contacts"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        <Save size={16} className="mr-2" />
                        {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                    </button>
                </div>
            </form>
        </div>
    );
}
