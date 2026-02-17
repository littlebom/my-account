"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import QuotationForm from "@/components/forms/QuotationForm";

export default function NewQuotationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            setLoading(true);
            await api.post("/quotations", data);
            alert("สร้างใบเสนอราคาเรียบร้อยแล้ว");
            router.push("/sales/quotations");
        } catch (error) {
            console.error("Failed to create quotation:", error);
            alert("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 relative">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/sales/quotations" className="p-2 rounded-full hover:bg-white text-gray-500 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">สร้างใบเสนอราคาใหม่</h1>
                    <p className="text-gray-500">กรอกข้อมูลเพื่อสร้างใบเสนอราคา</p>
                </div>
            </div>

            <QuotationForm
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel="บันทึกใบเสนอราคา"
                onCancel={() => router.push("/sales/quotations")}
            />
        </div>
    );
}
