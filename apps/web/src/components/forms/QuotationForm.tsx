"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Save, Plus, Trash2, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";

export interface Customer {
    id: string;
    name: string;
    address: string;
    taxId: string;
    phone?: string;
}

export interface Item {
    description: string;
    details?: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

interface QuotationFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading: boolean;
    submitLabel?: string;
    onCancel: () => void;
}

export default function QuotationForm({
    initialData,
    onSubmit,
    loading,
    submitLabel = "บันทึก",
    onCancel
}: QuotationFormProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);

    // Create Customer Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        code: "",
        name: "",
        taxId: "",
        address: "",
        phone: ""
    });

    const [formData, setFormData] = useState({
        customerId: initialData?.customerId || "",
        documentDate: initialData?.documentDate ? new Date(initialData.documentDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        validUntil: initialData?.validUntil ? new Date(initialData.validUntil).toISOString().split("T")[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: initialData?.notes || "",
        isTaxIncluded: false, // Default to Excluded (false) - Logic for existing data might need adjustment if we stored this flag
    });

    const [items, setItems] = useState<Item[]>(initialData?.items?.map((i: any) => ({
        description: i.description,
        details: i.details,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        amount: Number(i.amount)
    })) || [
            { description: "", details: "", quantity: 1, unitPrice: 0, amount: 0 }
        ]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const data = await api.get<Customer[]>("/contacts?type=customer");
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        }
    };

    const handleItemChange = (index: number, field: keyof Item, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto calculate amount
        if (field === "quantity" || field === "unitPrice") {
            const qty = field === "quantity" ? parseFloat(value) || 0 : newItems[index].quantity;
            const price = field === "unitPrice" ? parseFloat(value) || 0 : newItems[index].unitPrice;
            newItems[index].amount = qty * price;
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: "", details: "", quantity: 1, unitPrice: 0, amount: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const calculateTotals = () => {
        const totalLineAmount = items.reduce((sum, item) => sum + item.amount, 0);
        let subtotal = 0;
        let vatAmount = 0;
        let totalAmount = 0;

        if (formData.isTaxIncluded) {
            // Included: The amount IS the total. Back-calculate subtotal.
            totalAmount = totalLineAmount;
            subtotal = totalAmount / 1.07;
            vatAmount = totalAmount - subtotal;
        } else {
            // Excluded: The amount is subtotal. Add VAT.
            subtotal = totalLineAmount;
            vatAmount = subtotal * 0.07;
            totalAmount = subtotal + vatAmount;
        }

        return { subtotal, vatAmount, totalAmount };
    };

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreateLoading(true);
            const res = await api.post<Customer>("/contacts", {
                type: "customer",
                ...newCustomer
            });

            // Refresh customers and select the new one
            await fetchCustomers();
            setFormData({ ...formData, customerId: res.id });

            // Reset and close
            setNewCustomer({ code: "", name: "", taxId: "", address: "", phone: "" });
            setIsCreateModalOpen(false);

            alert("สร้างลูกค้าใหม่สำเร็จ");
        } catch (error) {
            console.error("Failed to create customer:", error);
            alert("เกิดข้อผิดพลาดในการสร้างลูกค้า");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerId) {
            alert("กรุณาเลือกลูกค้า");
            return;
        }

        const totals = calculateTotals();

        // Prepare payload
        const { isTaxIncluded, ...payload } = formData;

        onSubmit({
            ...payload,
            items,
            ...totals
        });
    };

    const totals = calculateTotals();
    const selectedCustomer = customers.find(c => c.id === formData.customerId);

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Info Card - 2 Columns */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Customer */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">ลูกค้า <span className="text-red-500">*</span></label>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
                                >
                                    <Plus size={14} className="mr-1" /> สร้างลูกค้าใหม่
                                </button>
                            </div>
                            <Combobox
                                options={customers.map(c => ({ label: c.name, value: c.id }))}
                                value={formData.customerId}
                                onChange={(value) => setFormData({ ...formData, customerId: value })}
                                placeholder="ค้นหาลูกค้า..."
                                emptyText="ไม่พบลูกค้า"
                            />

                            {/* Selected Customer Info Display */}
                            {selectedCustomer && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                    <div className="font-medium text-gray-900">{selectedCustomer.name}</div>
                                    <div className="text-gray-500 mt-1 flex items-start gap-2">
                                        <MapPin size={16} className="shrink-0 mt-0.5" />
                                        <span>{selectedCustomer.address || "- ไม่ระบุที่อยู่ -"}</span>
                                    </div>
                                    <div className="text-gray-500 mt-1 ml-6">
                                        เลขประจำตัวผู้เสียภาษี: {selectedCustomer.taxId || "-"}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Dates & Tax */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เอกสาร</label>
                                <Input
                                    type="date"
                                    value={formData.documentDate}
                                    onChange={(e) => setFormData({ ...formData, documentDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ยืนราคาถึงวันที่</label>
                                <Input
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบภาษี</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="taxType"
                                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                        checked={!formData.isTaxIncluded}
                                        onChange={() => setFormData({ ...formData, isTaxIncluded: false })}
                                    />
                                    <span className="text-gray-700">ราคาไม่รวมภาษี (Excl)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="taxType"
                                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                        checked={formData.isTaxIncluded}
                                        onChange={() => setFormData({ ...formData, isTaxIncluded: true })}
                                    />
                                    <span className="text-gray-700">ราคารวมภาษี (Incl)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">รายการสินค้า/บริการ</h3>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                                <div className="w-12 pt-8 text-center font-medium text-gray-500">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">รายละเอียด</label>
                                    <Input
                                        type="text"
                                        placeholder="ชื่อสินค้า/บริการ..."
                                        className="mb-2"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                        required
                                    />
                                    <textarea
                                        className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-900"
                                        placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)..."
                                        rows={1}
                                        value={item.details || ""}
                                        onChange={(e) => handleItemChange(index, "details", e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">จำนวน</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        className="text-right"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">ราคา/หน่วย</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="text-right"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">รวมเงิน</label>
                                    <Input
                                        type="number"
                                        readOnly
                                        className="bg-gray-100 text-right text-gray-600"
                                        value={item.amount.toFixed(2)}
                                    />
                                </div>
                                <button type="button" onClick={() => removeItem(index)} className="mt-6 text-gray-400 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addItem} className="mt-4 flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm">
                        <Plus size={16} className="mr-1" /> เพิ่มรายการ
                    </button>

                    {/* Summary */}
                    <div className="mt-6 border-t border-gray-200 pt-4 flex flex-col items-end space-y-2">
                        <div className="w-64 flex justify-between text-sm">
                            <span className="text-gray-500">รวมเป็นเงิน (Subtotal)</span>
                            <span className="font-medium">{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-64 flex justify-between text-sm">
                            <span className="text-gray-500">ภาษีมูลค่าเพิ่ม 7%</span>
                            <span className="font-medium">{totals.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-64 flex justify-between text-lg font-bold text-primary-700">
                            <span>{formData.isTaxIncluded ? "จำนวนเงินรวมทั้งสิ้น (ราคารวมภาษี)" : "จำนวนเงินรวมทั้งสิ้น"}</span>
                            <span>{totals.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-white py-2 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                    >
                        <Save size={16} className="mr-2" />
                        {loading ? "กำลังบันทึก..." : submitLabel}
                    </button>
                </div>
            </form>

            {/* Quick Create Customer Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">สร้างลูกค้าใหม่</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCustomer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสลูกค้า</label>
                                <Input
                                    value={newCustomer.code}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, code: e.target.value })}
                                    placeholder="เช่น C-001 (เว้นว่างเพื่อสร้างอัตโนมัติ)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท/ลูกค้า <span className="text-red-500">*</span></label>
                                <Input
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    required
                                    placeholder="ระบุชื่อบริษัท..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขผู้เสียภาษี</label>
                                <Input
                                    value={newCustomer.taxId}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, taxId: e.target.value })}
                                    placeholder="เลขประจำตัว 13 หลัก"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                                <Input
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    placeholder="ที่อยู่..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                <Input
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    placeholder="0xxxxxxxxx"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {createLoading ? "กำลังสร้าง..." : "ยืนยันสร้างลูกค้า"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
