import Link from "next/link";
import {
    Plus,
    FileText,
    PieChart,
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Users,
    MoreHorizontal
} from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
                    <p className="text-gray-500">ภาพรวมธุรกิจประจำเดือน</p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm">
                        <FileText size={16} className="mr-2" />
                        ส่งออกรายงาน
                    </button>
                    <Link href="/sales/invoices/new" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm transition-colors text-sm font-medium">
                        <Plus size={16} className="mr-2" />
                        สร้างใบแจ้งหนี้
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="รายได้รวม"
                    value="฿4,520,000"
                    change="+12.5%"
                    trend="up"
                    icon={<Wallet size={24} />}
                />
                <SummaryCard
                    title="ค่าใช้จ่ายรวม"
                    value="฿2,150,000"
                    change="-5.2%"
                    trend="down"
                    icon={<CreditCard size={24} />}
                />
                <SummaryCard
                    title="กำไรสุทธิ"
                    value="฿2,370,000"
                    change="+18.1%"
                    trend="up"
                    icon={<TrendingUp size={24} />}
                />
                <SummaryCard
                    title="ลูกหนี้ครบกำหนด"
                    value="฿850,000"
                    change="3 รายการ"
                    trend="neutral"
                    icon={<Users size={24} />}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction href="/sales/invoices/new" icon={<FileText size={24} />} label="สร้างใบแจ้งหนี้" />
                <QuickAction href="/accounting/journals/new" icon={<Plus size={24} />} label="บันทึกรายวัน" />
                <QuickAction href="/accounting/reports/trial-balance" icon={<PieChart size={24} />} label="ดูงบทดลอง" />
                <QuickAction href="/purchase/bills/new" icon={<CreditCard size={24} />} label="บันทึกค่าใช้จ่าย" />
            </div>

            {/* Two Columns Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-gray-900">กระแสเงินสด (Cash Flow)</h3>
                            <select className="text-sm border-gray-200 rounded-md text-gray-500 focus:ring-primary-500 focus:border-primary-500">
                                <option>6 เดือนย้อนหลัง</option>
                                <option>ปีนี้</option>
                            </select>
                        </div>
                        <div className="h-72 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <div className="text-center">
                                <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                                <span className="text-sm">กราฟแสดงรายรับ-รายจ่าย</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">ธุรกรรมล่าสุด</h3>
                            <Link href="/accounting/journals" className="text-sm text-primary-600 hover:text-primary-700 font-medium">ดูทั้งหมด</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-3">วันที่</th>
                                        <th className="px-6 py-3">รายการ</th>
                                        <th className="px-6 py-3">สถานะ</th>
                                        <th className="px-6 py-3 text-right">จำนวนเงิน</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { date: "27/01/2026", desc: "INV-2024-001 - บริษัท เอไอ จำกัด", status: "completed", amount: "+12,000.00" },
                                        { date: "26/01/2026", desc: "Office Supplies - ค่าวัสดุสำนักงาน", status: "pending", amount: "-1,500.00" },
                                        { date: "26/01/2026", desc: "INV-2024-002 - ลูกค้าทั่วไป", status: "completed", amount: "+4,500.00" },
                                        { date: "25/01/2026", desc: "Server Cost - ค่าบริการ Server", status: "completed", amount: "-850.00" },
                                    ].map((tx, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600">{tx.date}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.desc}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${tx.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-medium text-right ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>{tx.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Bank Accounts */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">บัญชีธนาคาร</h3>
                        <div className="space-y-4">
                            <BankAccount name="กสิกรไทย (KBANK)" number="xxx-2-34567-x" balance="฿1,250,000" color="bg-green-100 text-green-700" />
                            <BankAccount name="ไทยพาณิชย์ (SCB)" number="xxx-4-56789-x" balance="฿850,000" color="bg-purple-100 text-purple-700" />
                            <BankAccount name="เงินสดย่อย" number="Cash on Hand" balance="฿20,000" color="bg-gray-100 text-gray-700" />
                        </div>
                        <button className="w-full mt-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center">
                            <Plus size={16} className="mr-1" /> เชื่อมต่อธนาคาร
                        </button>
                    </div>

                    {/* Todo List */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">สิ่งที่ต้องทำ</h3>
                            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
                        </div>
                        <div className="space-y-3">
                            <TodoItem text="อนุมัติใบเสนอราคา #QT-2024-05" due="วันนี้" urgent />
                            <TodoItem text="ส่งใบวางบิล บริษัท เอไอโซลูชั่น" due="พรุ่งนี้" />
                            <TodoItem text="ยื่นภาษี ภ.พ. 30 (VAT)" due="อีก 3 วัน" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, change, trend, icon }: any) {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-primary-50 rounded-lg text-primary-600">
                    {icon}
                </div>
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-700' :
                        trend === 'down' ? 'bg-red-50 text-red-700' :
                            'bg-gray-100 text-gray-600'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> :
                        trend === 'down' ? <ArrowDownRight size={14} className="mr-1" /> : null}
                    {change}
                </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
}

function QuickAction({ href, icon, label }: any) {
    return (
        <Link
            href={href}
            className="group flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary-200 hover:shadow-md transition-all"
        >
            <div className="p-3 bg-gray-50 rounded-full text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors mb-3">
                {icon}
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">{label}</span>
        </Link>
    );
}

function BankAccount({ name, number, balance, color }: any) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${color}`}>
                {name.substring(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">{name}</p>
                <p className="text-xs text-gray-400 font-mono">{number}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{balance}</p>
        </div>
    )
}

function TodoItem({ text, due, urgent }: any) {
    return (
        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className={`mt-1 w-2 h-2 rounded-full ${urgent ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <div>
                <p className="text-sm text-gray-800 line-clamp-1">{text}</p>
                <p className="text-xs text-gray-400">ครบกำหนด: {due}</p>
            </div>
        </div>
    )
}
