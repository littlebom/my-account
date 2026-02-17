"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download, Mail } from "lucide-react";
import { api } from "@/lib/api";

interface ReceiptDetail {
    id: string;
    documentNumber: string;
    paymentDate: string;
    amount: number;
    paymentMethod: string;
    notes: string;
    invoice: {
        documentNumber: string;
        date: string;
        customer: {
            name: string;
            address: string;
            taxId: string;
        };
        items: any[]; // Assuming we don't need full item details for simple receipt, or fetch if needed
    };
}

export default function ReceiptDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchReceipt(params.id as string);
        }
    }, [params.id]);

    const fetchReceipt = async (id: string) => {
        try {
            // Can assume /payments/:id returns the payment with included invoice
            // But currently backend seems to only have findAll. We might need to rely on findAll filtering or assume frontend fetches list.
            // Let's assume we can fetch by ID or filter from list if API doesn't support getById yet. 
            // Wait, standard REST usually has getById. Let's check controller. 
            // Controller only has findAll. 
            // I should implement findOne in backend or filter client side. 
            // For robustness, I'll filter client side for now as I recall controller didn't have :id get.
            // Actually, let's fix backend controller to add findOne for better performance? 
            // No, strictly following plan is faster. Plan didn't say backend findOne. 
            // I'll fetch list and find. (Not efficient for prod but ok for prototype)
            // Correction: I should probably just fetch all and find, or just implement getById.
            // Let's implemented getById in controller? No, I'll use list filter for now to avoid context switching back to backend file.

            const allReceipts = await api.get<ReceiptDetail[]>("/payments?type=receive");
            const found = allReceipts.find(r => r.id === id);

            if (found) {
                setReceipt(found);
            } else {
                alert("Receipt not found");
                router.push("/sales/receipts");
            }
        } catch (error) {
            console.error("Failed to fetch receipt:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!receipt) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-between items-center print:hidden">
                <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    ย้อนกลับ
                </button>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-colors text-sm font-medium">
                        <Mail size={16} className="mr-2" />
                        ส่งอีเมล
                    </button>
                    <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm transition-colors text-sm font-medium">
                        <Printer size={16} className="mr-2" />
                        พิมพ์ใบเสร็จ (Print)
                    </button>
                </div>
            </div>

            {/* A4 Paper Layout */}
            <div className="bg-white shadow-lg p-8 rounded-xl print:shadow-none print:p-0 text-gray-900" style={{ minHeight: '297mm' }}>
                {/* Letterhead */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold print:text-black print:bg-transparent print:border print:border-black">
                            CA
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primary-800 print:text-black">บริษัท คลาวด์ แอคเคาท์ติ้ง จำกัด</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                123 อาคารสาทรซิตี้ ทาวเวอร์ ชั้น 10<br />
                                เขตสาทร กรุงเทพมหานคร 10120<br />
                                โทร: 02-123-4567 | เลขผู้เสียภาษี: 0105555123456
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-wide">ใบเสร็จรับเงิน</h2>
                        <h3 className="text-lg text-gray-500 uppercase tracking-wide mb-4">Receipt</h3>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-left">
                            <span className="text-gray-500">เลขที่เอกสาร:</span>
                            <span className="font-semibold">{receipt.documentNumber}</span>
                            <span className="text-gray-500">วันที่:</span>
                            <span>{new Date(receipt.paymentDate).toLocaleDateString("th-TH")}</span>
                            <span className="text-gray-500">อ้างอิง:</span>
                            <span>{receipt.invoice.documentNumber}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 print:bg-transparent print:border-gray-300">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">ได้รับเงินจาก (Received From)</h4>
                    <p className="text-lg font-bold text-gray-900">{receipt.invoice.customer.name}</p>
                    <p className="text-gray-600 whitespace-pre-line">{receipt.invoice.customer.address || "ที่อยู่ ไม่ระบุ"}</p>
                    <p className="text-sm text-gray-500 mt-2">เลขผู้เสียภาษี: {receipt.invoice.customer.taxId || "-"}</p>
                </div>

                {/* Payment Detail Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-primary-600 text-left">
                            <th className="py-3 font-semibold text-primary-800 w-16">ลำดับ</th>
                            <th className="py-3 font-semibold text-primary-800">รายการ (Description)</th>
                            <th className="py-3 font-semibold text-primary-800 text-right w-40">จำนวนเงิน (Amount)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                            <td className="py-4 align-top">1</td>
                            <td className="py-4 align-top">
                                <p className="font-semibold mb-1">ชำระค่าสินค้า/บริการ ตามใบแจ้งหนี้เลขที่ {receipt.invoice.documentNumber}</p>
                                <p className="text-sm text-gray-500">{receipt.notes || "-"}</p>
                            </td>
                            <td className="py-4 align-top text-right font-semibold text-lg">
                                {receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                        {/* Filler rows for height consistency if needed */}
                        <tr>
                            <td className="py-4">&nbsp;</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-gray-900">
                            <td colSpan={2} className="py-4 text-right font-bold text-gray-900">รวมทั้งสิ้น (Grand Total)</td>
                            <td className="py-4 text-right font-bold text-2xl text-primary-700 print:text-black">
                                {receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Amount in Words */}
                <div className="mb-12 bg-gray-50 px-4 py-2 rounded border border-dashed border-gray-300 text-center print:bg-transparent">
                    <span className="text-sm text-gray-500 mr-2">จำนวนเงินเป็นตัวอักษร:</span>
                    <span className="font-medium italic">- (รอฟังก์ชัน BahtText) -</span>
                </div>

                {/* Payment Method & Signature */}
                <div className="grid grid-cols-2 gap-12 mt-auto">
                    <div>
                        <h4 className="font-semibold mb-2">การชำระเงิน (Payment Method)</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border border-gray-400 ${receipt.paymentMethod === 'cash' ? 'bg-black' : ''}`}></div>
                                <span>เงินสด (Cash)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border border-gray-400 ${receipt.paymentMethod === 'bank_transfer' ? 'bg-black' : ''}`}></div>
                                <span>โอนเงิน (Bank Transfer)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border border-gray-400 ${receipt.paymentMethod === 'check' ? 'bg-black' : ''}`}></div>
                                <span>เช็ค (Cheque)</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="h-24 border-b border-gray-400 mb-2 relative">
                            {/* Digital Signature Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-20 text-4xl font-cursive">
                                Authorized Signature
                            </div>
                        </div>
                        <p className="font-semibold">{receipt.invoice.customer.name}</p>
                        <p className="text-xs text-gray-500">ผู้รับเงิน / Collector</p>
                        <p className="text-xs text-gray-500 mt-1">วันที่: {new Date(receipt.paymentDate).toLocaleDateString("th-TH")}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
