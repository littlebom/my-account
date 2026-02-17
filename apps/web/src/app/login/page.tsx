'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppStore } from '@/stores/app-store';
import { Loader2, Lock, Mail, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
    const router = useRouter();
    const setAccessToken = useAppStore((state) => state.setAccessToken);
    const setUser = useAppStore((state) => state.setUser);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post<{ access_token: string; user: any }>('/auth/login', {
                email,
                password,
            });

            setAccessToken(response.access_token);
            setUser(response.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#292524] p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#722f37]/20 blur-[100px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#722f37]/10 blur-[100px]" />
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
                {/* Header Section */}
                <div className="px-8 pt-12 pb-8 text-center">
                    <div className="w-20 h-20 bg-[#722f37] rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-all duration-300">
                        <span className="text-3xl font-bold text-white">CA</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#292524] tracking-tight">ยินดีต้อนรับ</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        เข้าสู่ระบบ Cloud Accounting Platform
                    </p>
                </div>

                {/* Form Section */}
                <div className="px-8 pb-12">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#292524] ml-1">อีเมล</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#722f37]">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    className="pl-11"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-sm font-semibold text-[#292524]">รหัสผ่าน</label>
                                <a href="#" className="text-xs font-medium text-[#722f37] hover:underline">
                                    ลืมรหัสผ่าน?
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#722f37]">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    className="pl-11"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#722f37]/20 text-sm font-bold text-white bg-[#722f37] hover:bg-[#5c262d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722f37] disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                <>
                                    เข้าสู่ระบบ
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Decoration */}
                <div className="bg-[#fcfaf9] px-8 py-5 border-t border-gray-100/50 flex justify-center">
                    <p className="text-xs text-gray-400 font-medium">© 2026 Cloud Accounting. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
