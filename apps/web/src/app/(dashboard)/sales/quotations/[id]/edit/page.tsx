"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import QuotationForm from "@/components/forms/QuotationForm";

export default function EditQuotationPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        if (params.id) {
            fetchQuotation(params.id as string);
        }
    }, [params.id]);

    const fetchQuotation = async (id: string) => {
        try {
            const data = await api.get(`/quotations/${id}`);
            setInitialData(data);
        } catch (error) {
            console.error("Failed to fetch quotation:", error);
            alert("ไม่พบข้อมูลใบเสนอราคา");
            router.push("/sales/quotations");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            setLoading(true);
            // Use the actual ID from initialData for the update, as the URL might be a Document Number
            // Backend uses PUT for updates
            await api.put(`/quotations/${initialData.id}`, data);
            alert("แก้ไขใบเสนอราคาเรียบร้อยแล้ว");
            router.push(`/sales/quotations/${params.id}`); // Keep using params.id (DocNo) for redirect
        } catch (error) {
            console.error("Failed to update quotation:", error);
            alert("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!initialData) return null;

    return (
        <div className="space-y-6 pb-20 relative">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/sales/quotations/${params.id}`} className="p-2 rounded-full hover:bg-white text-gray-500 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">แก้ไขใบเสนอราคา</h1>
                    <p className="text-gray-500">{initialData.documentNumber}</p>
                </div>
            </div>

            <QuotationForm
                initialData={initialData}
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel="บันทึกการแก้ไข"
                onCancel={() => router.push(`/sales/quotations/${params.id}`)}
            />
        </div>
    );
}
