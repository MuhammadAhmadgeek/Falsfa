import { useRef, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  GraduationCap, Users, ClipboardList, CalendarDays, BarChart3,
  DollarSign, Shield, Zap, ArrowRight, CheckCircle2, Star, Globe, ArrowDown
} from 'lucide-react'

// ── Scroll-driven reveal ─────────────────────────────────────
function useReveal(threshold = 0.2) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.unobserve(el) } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, visible]
}

// ── Parallax value on scroll ─────────────────────────────────
function useParallax() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const h = () => setY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return y
}

const FEATURES = [
  { icon: Users, title: 'Student Management', desc: 'Complete records from admission to graduation.', color: '#3b82f6' },
  { icon: ClipboardList, title: 'Exams & Results', desc: 'Auto-graded result cards with class rankings.', color: '#8b5cf6' },
  { icon: CalendarDays, title: 'Attendance', desc: 'Bulk marking with daily & monthly reports.', color: '#10b981' },
  { icon: GraduationCap, title: 'Staff Management', desc: 'Employee records and teacher assignments.', color: '#f59e0b' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Exportable performance dashboards.', color: '#ec4899' },
  { icon: DollarSign, title: 'Fee Collection', desc: 'Track payments in PKR with audit trail.', color: '#14b8a6' },
]

const MODULES = [
  'Parent Communication', 'Timetable Builder', 'Report Cards', 'Payroll',
  'Expense Tracking', 'Fee Analytics', 'Student Portal', 'Parent Portal',
  'Multi-Campus', 'ID Cards', 'Notice Board', 'Offline Mode',
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const scrollY = useParallax()
  const [heroRef, heroVis] = useReveal(0.1)
  const [featRef, featVis] = useReveal(0.15)
  const [modRef, modVis] = useReveal(0.15)
  const [whyRef, whyVis] = useReveal(0.15)
  const [ctaRef, ctaVis] = useReveal(0.2)

  return (
    <div className="bg-[#050510] text-white selection:bg-blue-500/30 relative min-h-screen">
      {/* ── GLOBAL CONTINUOUS BACKGROUND ─────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#050510]" />
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-blue-600/8 blur-[180px]" />
          <div className="absolute top-[40%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/6 blur-[150px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:80px_80px]" style={{ transform: `translateY(${scrollY * 0.05}px)` }} />
      </div>

      <div className="relative z-10">
        {/* ── NAVBAR ─────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-[100] mix-blend-difference">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-black" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Falsfa</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm text-white/60 font-medium">
              <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
              <a href="#modules" className="hover:text-white transition-colors duration-300">Modules</a>
              <a href="#why" className="hover:text-white transition-colors duration-300">Why Falsfa</a>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard" className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">Login</Link>
                  <Link to="/register" className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO  (fullscreen, cinematic)
         ══════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">

          {/* Content with staggered cinematic reveal */}
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            <div className={`transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${heroVis ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-xs text-blue-300 mb-10 backdrop-blur-sm">
                <Star className="h-3 w-3" /> Trusted by 500+ schools across Pakistan
              </div>
            </div>

            <h1 className={`transition-all duration-[1.4s] delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${heroVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
              <span className="block text-[clamp(2.5rem,8vw,7rem)] font-black tracking-[-0.04em] leading-[0.95]">
                ONE PLATFORM
              </span>
              <span className="block text-[clamp(2.5rem,8vw,7rem)] font-black tracking-[-0.04em] leading-[0.95] bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                YOUR ENTIRE SCHOOL
              </span>
            </h1>

            <p className={`max-w-2xl mx-auto text-lg text-white/40 mt-8 mb-12 leading-relaxed transition-all duration-[1.4s] delay-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${heroVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
              Students, fees, attendance, exams and reporting — unified in one secure system designed for Pakistani schools.
            </p>

            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-[1.4s] delay-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${heroVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <Link to="/register" className="group inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-black text-base font-bold hover:scale-105 active:scale-95 transition-transform duration-300">
                Register now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
              <Link to="/login" className="px-10 py-4 rounded-full border border-white/15 text-base font-medium hover:bg-white/5 transition-all duration-300">
                Login
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 delay-1000 ${heroVis ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">Scroll</span>
            <ArrowDown className="h-4 w-4 text-white/20 animate-bounce" />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
          SECTION 2 — FEATURES
         ══════════════════════════════════════════════════════ */}
        <section id="features" ref={featRef} className="relative py-32 px-6 lg:px-8 overflow-hidden">


          <div className="relative max-w-7xl mx-auto">
            {/* Section header — dramatic type */}
            <div className={`mb-20 transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${featVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <p className="text-sm font-bold text-blue-400 tracking-[0.3em] uppercase mb-4">FEATURES</p>
              <h2 className="text-[clamp(2rem,5vw,4rem)] font-black tracking-[-0.03em] leading-[1.05]">
                EVERYTHING YOUR<br />
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">SCHOOL RUNS ON</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-3xl overflow-hidden">
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className={`group relative p-8 bg-[#050510] hover:bg-white/[0.03] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-default ${featVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                    style={{ transitionDelay: featVis ? `${300 + i * 120}ms` : '0ms' }}
                  >
                    {/* Hover glow line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ color: f.color }} />

                    <div className="mb-5 inline-flex p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110" style={{ background: `${f.color}15` }}>
                      <Icon className="h-6 w-6" style={{ color: f.color }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 tracking-tight">{f.title}</h3>
                    <p className="text-sm text-white/35 leading-relaxed">{f.desc}</p>

                    {/* Corner arrow on hover */}
                    <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-white/0 group-hover:text-white/30 translate-x-2 group-hover:translate-x-0 transition-all duration-500" />
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
          SECTION 3 — MODULES (horizontal scroll feel)
         ══════════════════════════════════════════════════════ */}
        <section id="modules" ref={modRef} className="relative py-32 px-6 lg:px-8 overflow-hidden">
          <div className="relative max-w-7xl mx-auto">
            <div className={`mb-20 transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${modVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <p className="text-sm font-bold text-violet-400 tracking-[0.3em] uppercase mb-4">MODULES</p>
              <h2 className="text-[clamp(2rem,5vw,4rem)] font-black tracking-[-0.03em] leading-[1.05]">
                EVERY MODULE<br />
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">YOUR SCHOOL NEEDS</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {MODULES.map((m, i) => (
                <div
                  key={m}
                  className={`group flex items-center gap-3 p-5 rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-default ${modVis ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
                  style={{ transitionDelay: modVis ? `${i * 60}ms` : '0ms' }}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 group-hover:scale-125 transition-transform duration-500" />
                  <span className="text-sm text-white/50 group-hover:text-white/80 font-medium transition-colors duration-300">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
          SECTION 4 — WHY FALSFA (cinematic cards)
         ══════════════════════════════════════════════════════ */}
        <section id="why" ref={whyRef} className="relative py-32 px-6 lg:px-8 overflow-hidden">
          <div className="relative max-w-7xl mx-auto">
            <div className={`mb-20 text-center transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${whyVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <p className="text-sm font-bold text-emerald-400 tracking-[0.3em] uppercase mb-4">WHY FALSFA</p>
              <h2 className="text-[clamp(2rem,5vw,4rem)] font-black tracking-[-0.03em] leading-[1.05]">
                LOCAL BY DESIGN<br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">ENTERPRISE BY STANDARD</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Globe, title: 'Native PKR Billing', desc: 'All pricing in Pakistani Rupees. No conversion needed.', color: '#3b82f6' },
                { icon: Zap, title: 'Cloud-First', desc: 'Always up-to-date, accessible from any device.', color: '#f59e0b' },
                { icon: Shield, title: 'Local Support', desc: 'Pakistan-based team, Urdu & English, guaranteed SLAs.', color: '#10b981' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className={`group relative p-10 rounded-3xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)] text-center cursor-default overflow-hidden ${whyVis ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-90'}`}
                    style={{ transitionDelay: whyVis ? `${300 + i * 200}ms` : '0ms' }}
                  >
                    {/* Background glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}10 0%, transparent 70%)` }} />

                    <div className="relative">
                      <div className="mx-auto mb-6 inline-flex p-5 rounded-2xl transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-1" style={{ background: `${item.color}12` }}>
                        <Icon className="h-8 w-8" style={{ color: item.color }} />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 tracking-tight">{item.title}</h3>
                      <p className="text-sm text-white/35 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
          SECTION 5 — CTA (dramatic scale-in)
         ══════════════════════════════════════════════════════ */}
        <section ref={ctaRef} className="relative py-32 px-6 lg:px-8">
          <div className={`relative max-w-5xl mx-auto text-center transition-all duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] ${ctaVis ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-black tracking-[-0.03em] leading-[1.05] mb-6">
              READY TO<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">TRANSFORM YOUR SCHOOL?</span>
            </h2>
            <p className="text-white/30 text-lg mb-12 max-w-xl mx-auto">
              Join hundreds of Pakistani schools already running on Falsfa. Get started in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="group inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-black text-base font-bold hover:scale-105 active:scale-95 transition-transform duration-300">
                Start free trial <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link to="/login" className="px-10 py-4 rounded-full border border-white/15 text-base font-medium hover:bg-white/5 transition-all duration-300">
                Talk to sales
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer className="border-t border-white/5 py-16 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-10 mb-12">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-black" />
                  </div>
                  <span className="text-sm font-bold">Falsfa</span>
                </div>
                <p className="text-xs text-white/25 leading-relaxed">Powerful school management software built for Pakistani schools.</p>
              </div>
              {[
                { title: 'Product', links: [{ label: 'Features', href: '/#features' }, { label: 'Modules', href: '/#modules' }] },
                { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] },
                { title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }] },
              ].map(g => (
                <div key={g.title}>
                  <h4 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] mb-4">{g.title}</h4>
                  <ul className="space-y-2.5">
                    {g.links.map(l => (
                      <li key={l.label}>
                        {l.href.startsWith('/#') ? (
                          <a href={l.href} className="text-sm text-white/25 hover:text-white/50 transition-colors duration-300">
                            {l.label}
                          </a>
                        ) : (
                          <Link to={l.href} className="text-sm text-white/25 hover:text-white/50 transition-colors duration-300">
                            {l.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-white/5 pt-8 text-center">
              <p className="text-xs text-white/15">© {new Date().getFullYear()} Falsfa. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
