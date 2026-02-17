"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";

interface Contact {
    id: string;
    code: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    taxId: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const result = await api.get<Contact[]>("/contacts?type=customer");
            setContacts(result);
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("คุณต้องการลบข้อมูลลูกค้ารายนี้ใช่หรือไม่?")) return;

        try {
            await api.delete(`/contacts/${id}?type=customer`);
            setContacts((prev) => prev.filter((c) => c.id !== id));
        } catch (error) {
            console.error("Failed to delete contact:", error);
            alert("ไม่สามารถลบข้อมูลได้ (อาจมีการใช้งานในเอกสารอื่น)");
        }
    };

    const filteredContacts = contacts.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ลูกค้า (Customers)</h1>
                    <p className="text-gray-500">จัดการข้อมูลลูกค้าสำหรับออกใบแจ้งหนี้</p>
                </div>
                <Link
                    href="/sales/contacts/new"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm transition-colors text-sm font-medium"
                >
                    <Plus size={16} className="mr-2" />
                    เพิ่มลูกค้า
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -trangray-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาลูกค้า (ชื่อ, รหัส, Tax ID)..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อลูกค้า / รหัส</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ข้อมูลติดต่อ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax ID</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                        กำลังโหลดข้อมูล...
                                    </td>
                                </tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                        ไม่พบข้อมูลลูกค้า
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-primary-600">{contact.name}</div>
                                            <div className="text-xs text-gray-500">{contact.code}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {contact.phone && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Phone size={12} className="mr-1" />
                                                        {contact.phone}
                                                    </div>
                                                )}
                                                {contact.email && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Mail size={12} className="mr-1" />
                                                        {contact.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {contact.taxId || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/sales/contacts/${contact.id}/edit`} className="text-gray-400 hover:text-primary-600 p-1">
                                                    <Pencil size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(contact.id)}
                                                    className="text-gray-400 hover:text-red-600 p-1"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
