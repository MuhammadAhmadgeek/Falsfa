import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

// ── Shared Layout Component ──────────────────────────────────────────────
function PublicLayout({ children, title }) {
  return (
    <div className="bg-[#050510] text-white selection:bg-blue-500/30 relative min-h-screen flex flex-col">
      {/* ── GLOBAL CONTINUOUS BACKGROUND ─────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#050510]" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-blue-600/8 blur-[180px]" />
        <div className="absolute top-[40%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/6 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* ── NAVBAR ─────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-[100] mix-blend-difference bg-[#050510]/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-black" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Falsfa</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* ── CONTENT ────────────────────────────────────────── */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-40 pb-20">
          <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] mb-12 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            {title}
          </h1>
          <div className="prose prose-invert prose-blue max-w-none prose-p:leading-relaxed prose-p:text-white/60 prose-headings:text-white">
            {children}
          </div>
        </main>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer className="border-t border-white/5 py-12 px-6 lg:px-8 mt-auto">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} Falsfa. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// ── Page Components ──────────────────────────────────────────────────────

export function AboutPage() {
  return (
    <PublicLayout title="About Falsfa">
      <p className="text-lg mb-6">
        Falsfa is a modern, unified school management platform built specifically for the needs of Pakistani educational institutions.
      </p>
      <h3>Our Mission</h3>
      <p>
        Our mission is to simplify school administration by bringing all core operations—student records, fees, attendance, and exams—into a single, easy-to-use digital ecosystem. We believe that technology should empower educators, not complicate their lives.
      </p>
      <h3>Why Falsfa?</h3>
      <p>
        Built with deep understanding of local challenges, Falsfa offers native PKR billing, fully customizable grading systems that fit local curriculum standards, and robust offline-first capabilities to ensure your school never stops running, even when the internet does.
      </p>
    </PublicLayout>
  )
}

export function ContactPage() {
  return (
    <PublicLayout title="Contact Us">
      <p className="text-lg mb-8">
        We're here to help your school transition to a better digital future. Reach out to our team for support, sales inquiries, or custom feature requests.
      </p>
      
      <div className="grid md:grid-cols-2 gap-8 mt-8 not-prose">
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-xl font-bold mb-2">Sales & Onboarding</h3>
          <p className="text-white/50 text-sm mb-4">Want to see a live demo or get pricing details?</p>
          <a href="mailto:sales@falsfa.com" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">sales@falsfa.com</a>
        </div>
        
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-xl font-bold mb-2">Technical Support</h3>
          <p className="text-white/50 text-sm mb-4">Need help using the platform? We're available 24/7.</p>
          <a href="mailto:support@falsfa.com" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">support@falsfa.com</a>
        </div>
      </div>
    </PublicLayout>
  )
}

export function PrivacyPage() {
  return (
    <PublicLayout title="Privacy Policy">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h3>1. Information We Collect</h3>
      <p>
        Falsfa collects information to provide better services to our users. This includes basic information like your name and email, as well as school operational data that you input into the system (such as student records, fee transactions, and attendance logs).
      </p>
      <h3>2. How We Use Information</h3>
      <p>
        We use the information we collect to operate, maintain, and improve our services. Falsfa acts as a data processor for school records—the school remains the data controller. We do not sell your personal or school data to third parties.
      </p>
      <h3>3. Data Security</h3>
      <p>
        We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest.
      </p>
    </PublicLayout>
  )
}

export function TermsPage() {
  return (
    <PublicLayout title="Terms of Service">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h3>1. Acceptance of Terms</h3>
      <p>
        By accessing or using the Falsfa platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
      </p>
      <h3>2. License to Use</h3>
      <p>
        Falsfa grants your institution a non-exclusive, non-transferable, revocable license to access and use the software strictly in accordance with your subscription plan.
      </p>
      <h3>3. User Responsibilities</h3>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to use the service for any illegal or unauthorized purpose.
      </p>
      <h3>4. Service Availability</h3>
      <p>
        While we strive for 99.9% uptime, Falsfa does not guarantee that the service will be uninterrupted or error-free. We reserve the right to perform scheduled maintenance.
      </p>
    </PublicLayout>
  )
}
