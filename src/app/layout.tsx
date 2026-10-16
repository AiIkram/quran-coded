import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "مُتقِن ورش | الحفظ برواية ورش عن نافع من طريق الأزرق",
  description:
    "منصة أنيقة لحفظ القرآن الكريم برواية ورش عن نافع من طريق الأزرق: مصحف تفاعلي، صوت ياسين الجزائري آيةً آية، تكرار مرن، فهم قبل الحفظ، ومراجعة ذكية.",
};


function Mark({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="شعار متقن ورش">
      <defs>
        <linearGradient id="mm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12705A" />
          <stop offset="1" stopColor="#0A3A2C" />
        </linearGradient>
        <linearGradient id="mm-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3C579" />
          <stop offset="1" stopColor="#C79A3F" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="61" height="61" rx="17" fill="url(#mm-bg)" />
      <rect x="6.5" y="6.5" width="51" height="51" rx="12" fill="none" stroke="url(#mm-gold)" strokeWidth="1" opacity="0.55" />
      <path d="M17 17 H47 V47 H17 Z" fill="none" stroke="url(#mm-gold)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M32 10 L54 32 L32 54 L10 32 Z" fill="none" stroke="url(#mm-gold)" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="9.5" fill="#FFFDF7" />
      <circle cx="32" cy="32" r="4.2" fill="#0E5A45" />
      <circle cx="32" cy="21.2" r="1.5" fill="url(#mm-gold)" />
      <circle cx="32" cy="42.8" r="1.5" fill="url(#mm-gold)" />
    </svg>
  );
}

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/hifz", label: "مصحف الحفظ" },
  { href: "/reciters", label: "القُرّاء" },
  { href: "/progress", label: "تقدّمي" },
  { href: "/account", label: "حسابي" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="star-pattern min-h-screen antialiased">
        <header className="sticky top-0 z-50 border-b border-[#E6E2D8] bg-[#FAF9F5]/92 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="group flex items-center gap-3">
              <Mark />
              <span className="leading-tight">
                <span className="font-display block text-xl font-bold text-[#0E5A45] transition group-hover:text-[#0A3A2C]">
                  مُتقِن ورش
                </span>
                <span className="block text-[11px] font-medium tracking-wide text-[#6C7A73]">
                  ورش عن نافع • طريق الأزرق
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-[#E6E2D8] bg-white p-1 shadow-[0_1px_2px_rgba(22,34,30,0.05)] lg:flex">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    l.href === "/hifz"
                      ? "bg-[#0E5A45] text-[#FFFDF7] shadow-[0_4px_10px_rgba(14,90,69,0.25)]"
                      : "text-[#6C7A73] hover:bg-[#F2F8F5] hover:text-[#0E5A45]"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/hifz" className="btn-gold hidden rounded-full px-6 py-2.5 text-sm lg:block">
                ابدأ الحفظ ◈
              </Link>
              <Link
                href="/hifz"
                className="btn-gold grid h-11 w-11 place-items-center rounded-full text-lg lg:hidden"
                aria-label="مصحف الحفظ"
              >
                ◈
              </Link>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-2.5 text-[13px] font-bold lg:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 ${
                  l.href === "/hifz"
                    ? "border-[#0E5A45] bg-[#0E5A45] text-[#FFFDF7]"
                    : "border-[#E6E2D8] bg-white text-[#6C7A73]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </header>

        {children}

        <footer className="mt-20 border-t-2 border-[#A87B2A]/60 bg-[#0B1C17] pb-40 text-[#E9E4D6]">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <Mark className="h-12 w-12" />
                <div>
                  <div className="font-display text-2xl font-bold text-[#F0EAD9]">مُتقِن ورش</div>
                  <div className="text-[11px] tracking-wide text-[#9DAAA1]">رواية ورش عن نافع من طريق الأزرق</div>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-8 text-[#AEBAB2]">
                منصة مغاربية أنيقة لحفظ القرآن: نصٌّ ورشيّ أصيل، تكرار مرن آيةً آية بصوت قراء ورش،
                «افهم قبل الحفظ» بتفسير مختصر، ومراجعة مجدولة بمنحنى النسيان.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold text-[#D9C48B]">
                {["مد البدل ٤ حركات", "النقل", "التقليل", "ترقيق الراء", "صلة الميم"].map((t) => (
                  <span key={t} className="rounded-full border border-[#A87B2A]/40 bg-[#A87B2A]/10 px-3 py-1.5">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold text-[#F0EAD9]">أقسام المنصة</div>
              <ul className="mt-4 space-y-2.5 text-sm text-[#AEBAB2]">
                <li><Link href="/hifz" className="transition hover:text-[#E3C579]">مصحف الحفظ والتكرار</Link></li>
                <li><Link href="/reciters" className="transition hover:text-[#E3C579]">قراء ورش</Link></li>
                <li><Link href="/progress" className="transition hover:text-[#E3C579]">لوحة التقدم والمراجعة</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-[#F0EAD9]">مصادر المحتوى</div>
              <ul className="mt-4 space-y-2.5 text-sm text-[#AEBAB2]">
                <li>النص الورشي: Tanzil</li>
                <li>صوت الآيات: EveryAyah (ورش)</li>
                <li>السور الكاملة: MP3Quran</li>
                <li>التفسير: التيسير الكريم الرحمن</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-[#9DAAA1] sm:flex-row">
              <span>لأهل القرآن في الجزائر والمغرب الإسلامي — رواية ورش عن نافع من طريق الأزرق</span>
              <span className="font-quran text-base text-[#E3C579]">﴿ بَلْ هُوَ قُرْآنٌ مَجِيدٌ ﴾</span>
            </div>
            <div className="mx-auto max-w-3xl px-4 pb-8 text-center">
              <p className="font-display text-sm font-bold text-[#E3C579]">صدقة جارية بإذن الله</p>
              <p className="mt-2 text-sm leading-7 text-[#D6DCD6]">هذه صدقة جارية عنّي وعن أحبّتي، وعن أهل فلسطين. نسأل الله أن يحرّرهم، وأن يرزقنا الصلاة في المسجد الأقصى من جديد، إن شاء الله.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
