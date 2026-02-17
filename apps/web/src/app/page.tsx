import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="bg-primary text-primary-foreground">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">CA</span>
            </div>
            <span className="text-xl font-bold">CloudAccount</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:underline">
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition"
            >
              ทดลองใช้ฟรี
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ระบบบัญชีออนไลน์
            <br />
            <span className="text-white/80">สำหรับธุรกิจยุคใหม่</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            จัดการงานบัญชี ภาษี สต็อก และเงินเดือนได้ในที่เดียว
            พร้อม AI ช่วยบันทึกบัญชีอัตโนมัติ
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition"
            >
              เริ่มต้นใช้งาน
            </Link>
            <Link
              href="/demo"
              className="border border-white/50 px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              ดู Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            ฟีเจอร์ครบครัน
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "ระบบบัญชี",
                desc: "ผังบัญชี สมุดรายวัน งบการเงิน",
                icon: "📊",
              },
              {
                title: "ขาย-ซื้อ",
                desc: "ใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ",
                icon: "🧾",
              },
              {
                title: "สต็อกสินค้า",
                desc: "หลายคลัง ต้นทุน แจ้งเตือน",
                icon: "📦",
              },
              {
                title: "เงินเดือน",
                desc: "คำนวณอัตโนมัติ e-Slip ภ.ง.ด.",
                icon: "💰",
              },
              {
                title: "ภาษี",
                desc: "VAT WHT 50ทวิ e-Tax Invoice",
                icon: "📋",
              },
              {
                title: "AI อัจฉริยะ",
                desc: "OCR สแกนบิล บันทึกอัตโนมัติ",
                icon: "🤖",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">พร้อมเริ่มต้นหรือยัง?</h2>
          <p className="text-white/80 mb-8">
            ทดลองใช้ฟรี 30 วัน ไม่ต้องใส่บัตรเครดิต
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition"
          >
            สมัครใช้งานฟรี
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-white/60">
            © 2026 CloudAccount. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
