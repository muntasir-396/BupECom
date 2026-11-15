'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  GraduationCap,
  Building2,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Mail,
  Phone,
  ArrowRight
} from 'lucide-react'
import { UserProfile, UserRole } from '@/lib/types'
import { DEMO_USERS } from '@/lib/mock-data'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccessLogin: (user: UserProfile) => void
  initialTab?: 'bup' | 'outside-login' | 'outside-register'
}

export function AuthModal({ isOpen, onClose, onSuccessLogin, initialTab = 'bup' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'bup' | 'outside-login' | 'outside-register'>(initialTab)

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [initialTab, isOpen])

  // BUP Login State
  const [bupId, setBupId] = useState('')
  const [bupPassword, setBupPassword] = useState('')
  const [showBupPass, setShowBupPass] = useState(false)
  const [bupError, setBupError] = useState('')
  const [isBupLoading, setIsBupLoading] = useState(false)

  // Outside Login State
  const [outsideEmail, setOutsideEmail] = useState('')
  const [outsidePassword, setOutsidePassword] = useState('')
  const [showOutsidePass, setShowOutsidePass] = useState(false)
  const [outsideLoginError, setOutsideLoginError] = useState('')
  const [isOutsideLoading, setIsOutsideLoading] = useState(false)

  // Outside Register State
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regRole, setRegRole] = useState<'General Buyer' | 'External Vendor' | 'Campus Visitor'>('General Buyer')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPass, setShowRegPass] = useState(false)
  const [regError, setRegError] = useState('')
  const [isRegLoading, setIsRegLoading] = useState(false)

  if (!isOpen) return null

  // Handle BUP Student / Faculty Login
  const handleBupLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setBupError('')

    const trimmedId = bupId.trim()
    if (!trimmedId) {
      setBupError('Please enter your BUP Student ID or Employee ID (e.g. 22041108 or BUP-FAC-102)')
      return
    }

    if (!bupPassword) {
      setBupError('Please enter your BUP portal password')
      return
    }

    setIsBupLoading(true)
    setTimeout(() => {
      setIsBupLoading(false)
      // Check if matches faculty or student
      const isFaculty = trimmedId.toUpperCase().includes('FAC') || trimmedId.toLowerCase().includes('faculty')
      const targetDemo = isFaculty ? DEMO_USERS.faculty : DEMO_USERS.student

      const user: UserProfile = {
        ...targetDemo,
        studentId: trimmedId,
        name: isFaculty ? (trimmedId === DEMO_USERS.faculty.studentId ? DEMO_USERS.faculty.name : `Faculty Member (${trimmedId})`)
                        : (trimmedId === DEMO_USERS.student.studentId ? DEMO_USERS.student.name : `BUP Student (${trimmedId})`),
      }

      onSuccessLogin(user)
      onClose()
    }, 600)
  }

  // Handle Outside User Login
  const handleOutsideLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setOutsideLoginError('')

    if (!outsideEmail.trim()) {
      setOutsideLoginError('Please enter your registered email address or phone')
      return
    }
    if (!outsidePassword) {
      setOutsideLoginError('Please enter your account password')
      return
    }

    setIsOutsideLoading(true)
    setTimeout(() => {
      setIsOutsideLoading(false)
      const user: UserProfile = {
        id: `outside_${Date.now()}`,
        name: outsideEmail.includes('@') ? outsideEmail.split('@')[0] : 'Outside Guest',
        email: outsideEmail.includes('@') ? outsideEmail : `${outsideEmail}@guest.com`,
        role: 'outside',
        phone: !outsideEmail.includes('@') ? outsideEmail : '+880 1700 000000',
        isBupVerified: false,
      }
      onSuccessLogin(user)
      onClose()
    }, 500)
  }

  // Handle Outside User Registration
  const handleOutsideRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')

    if (!regName.trim()) {
      setRegError('Please enter your full name')
      return
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please enter a valid email address')
      return
    }
    if (!regPhone.trim()) {
      setRegError('Please enter your contact phone number')
      return
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long')
      return
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match')
      return
    }

    setIsRegLoading(true)
    setTimeout(() => {
      setIsRegLoading(false)
      const newUser: UserProfile = {
        id: `outside_reg_${Date.now()}`,
        name: regName.trim(),
        email: regEmail.trim(),
        role: 'outside',
        phone: regPhone.trim(),
        isBupVerified: false,
      }
      onSuccessLogin(newUser)
      onClose()
    }, 700)
  }

  // Quick fill demo helpers
  const fillStudentDemo = () => {
    setBupId('22041108')
    setBupPassword('bupstudent2026')
    setBupError('')
  }

  const fillFacultyDemo = () => {
    setBupId('BUP-FAC-102')
    setBupPassword('bupfaculty2026')
    setBupError('')
  }

  const fillOutsideDemo = () => {
    setOutsideEmail('murshed.mirpur@gmail.com')
    setOutsidePassword('guest12345')
    setOutsideLoginError('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1414]/70 p-4 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[#392525]/15 bg-[#FAF5E9] shadow-2xl">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#213527] to-[#17251c] px-6 py-5 text-[#FAF5E9]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#E3E890] text-[#213527] shadow-md">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="font-serif text-xl font-bold tracking-tight text-white">
                Sign In
              </h2>
              <p className="text-xs text-[#FAF5E9]/75">
                BUP Nest Portal
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-black/25 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('bup')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                activeTab === 'bup'
                  ? 'bg-[#E3E890] text-[#213527] shadow-sm font-bold'
                  : 'text-[#FAF5E9]/80 hover:text-white'
              }`}
            >
              <GraduationCap className="size-3.5" />
              <span>BUP ID</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('outside-login')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                activeTab === 'outside-login'
                  ? 'bg-[#E3E890] text-[#213527] shadow-sm font-bold'
                  : 'text-[#FAF5E9]/80 hover:text-white'
              }`}
            >
              <User className="size-3.5" />
              <span>Guest</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('outside-register')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                activeTab === 'outside-register'
                  ? 'bg-[#E3E890] text-[#213527] shadow-sm font-bold'
                  : 'text-[#FAF5E9]/80 hover:text-white'
              }`}
            >
              <Sparkles className="size-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="overflow-y-auto px-6 py-5 text-[#392525]">

          {/* TAB 1: BUP STUDENT & FACULTY LOGIN */}
          {activeTab === 'bup' && (
            <div>
              {bupError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-100 p-3 text-xs text-red-700">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{bupError}</span>
                </div>
              )}

              <form method="POST" onSubmit={handleBupLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                    Student or Faculty ID
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3E4734]/60">
                      <GraduationCap className="size-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. 22041108 or BUP-FAC-102"
                      value={bupId}
                      onChange={(e) => setBupId(e.target.value)}
                      className="w-full rounded-xl border border-[#392525]/20 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-[#392525] outline-none transition focus:border-[#2d4734] focus:ring-2 focus:ring-[#2d4734]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3E4734]/60">
                      <Lock className="size-4" />
                    </span>
                    <input
                      type={showBupPass ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={bupPassword}
                      onChange={(e) => setBupPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#392525]/20 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-[#392525] outline-none transition focus:border-[#2d4734] focus:ring-2 focus:ring-[#2d4734]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBupPass(!showBupPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#3E4734]/60 hover:text-[#392525]"
                    >
                      {showBupPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-[#3E4734] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-[#2d4734]" />
                    <span>Remember me</span>
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('Please contact BUP ICT cell at support@bup.edu.bd to reset your credentials.')
                    }}
                    className="font-semibold text-[#B25D3E] hover:underline"
                  >
                    Forgot ID?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isBupLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#213527] py-3 text-sm font-bold text-[#FAF5E9] shadow-md transition-all hover:bg-[#18261c] disabled:opacity-70"
                >
                  {isBupLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>Sign In with BUP ID</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Quick Fill */}
              <div className="mt-4 flex items-center justify-between text-[11px] text-[#728383] border-t border-[#392525]/10 pt-3">
                <span>Demo fill:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={fillStudentDemo}
                    className="rounded-lg bg-[#2d4734]/10 px-2.5 py-1 text-xs font-semibold text-[#213527] hover:bg-[#2d4734]/20"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={fillFacultyDemo}
                    className="rounded-lg bg-[#392525]/10 px-2.5 py-1 text-xs font-semibold text-[#392525] hover:bg-[#392525]/20"
                  >
                    Faculty
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OUTSIDE USER LOGIN */}
          {activeTab === 'outside-login' && (
            <div>
              {outsideLoginError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-100 p-3 text-xs text-red-700">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{outsideLoginError}</span>
                </div>
              )}

              <form method="POST" onSubmit={handleOutsideLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                    Email or Phone
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3E4734]/60">
                      <Mail className="size-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="name@example.com or phone"
                      value={outsideEmail}
                      onChange={(e) => setOutsideEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#392525]/20 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-[#392525] outline-none transition focus:border-[#B25D3E] focus:ring-2 focus:ring-[#B25D3E]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3E4734]/60">
                      <Lock className="size-4" />
                    </span>
                    <input
                      type={showOutsidePass ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={outsidePassword}
                      onChange={(e) => setOutsidePassword(e.target.value)}
                      className="w-full rounded-xl border border-[#392525]/20 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-[#392525] outline-none transition focus:border-[#B25D3E] focus:ring-2 focus:ring-[#B25D3E]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOutsidePass(!showOutsidePass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#3E4734]/60 hover:text-[#392525]"
                    >
                      {showOutsidePass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#3E4734]/80">
                    No account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('outside-register')}
                      className="font-bold text-[#B25D3E] hover:underline"
                    >
                      Register here
                    </button>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isOutsideLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#392525] py-3 text-sm font-bold text-[#FAF5E9] shadow-md transition-all hover:bg-[#271919] disabled:opacity-70"
                >
                  {isOutsideLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      <span>Sign In as Guest</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo quick fill */}
              <div className="mt-4 flex items-center justify-between text-[11px] text-[#728383] border-t border-[#392525]/10 pt-3">
                <span>Demo fill:</span>
                <button
                  type="button"
                  onClick={fillOutsideDemo}
                  className="rounded-lg bg-[#B25D3E]/10 px-2.5 py-1 text-xs font-semibold text-[#B25D3E] hover:bg-[#B25D3E]/20"
                >
                  Guest Account
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: OUTSIDE USER REGISTRATION */}
          {activeTab === 'outside-register' && (
            <div>
              {regError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-100 p-3 text-xs text-red-700">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form method="POST" onSubmit={handleOutsideRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                    Full Name *
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3E4734]/60">
                      <User className="size-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Farhan Chowdhury"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full rounded-xl border border-[#392525]/20 bg-white py-2 pl-10 pr-4 text-sm font-medium text-[#392525] outline-none transition focus:border-[#B25D3E] focus:ring-2 focus:ring-[#B25D3E]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                      Email Address *
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3E4734]/60">
                        <Mail className="size-3.5" />
                      </span>
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full rounded-xl border border-[#392525]/20 bg-white py-2 pl-9 pr-3 text-sm font-medium text-[#392525] outline-none transition focus:border-[#B25D3E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                      Phone Number *
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3E4734]/60">
                        <Phone className="size-3.5" />
                      </span>
                      <input
                        type="tel"
                        placeholder="+880 17xxxxxxxx"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full rounded-xl border border-[#392525]/20 bg-white py-2 pl-9 pr-3 text-sm font-medium text-[#392525] outline-none transition focus:border-[#B25D3E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                      Password *
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showRegPass ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full rounded-xl border border-[#392525]/20 bg-white py-2 px-3 text-sm font-medium text-[#392525] outline-none transition focus:border-[#B25D3E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                      Confirm Password *
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showRegPass ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-[#392525]/20 bg-white py-2 px-3 text-sm font-medium text-[#392525] outline-none transition focus:border-[#B25D3E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="text-[#3E4734]/80 hover:text-[#392525]"
                  >
                    {showRegPass ? 'Hide password' : 'Show password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('outside-login')}
                    className="font-bold text-[#B25D3E] hover:underline"
                  >
                    Have an account? Sign in
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isRegLoading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B25D3E] py-3 text-sm font-bold text-[#FAF5E9] shadow-md transition-all hover:bg-[#96472d] disabled:opacity-70"
                >
                  {isRegLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating account...
                    </span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <CheckCircle2 className="size-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="border-t border-[#392525]/10 bg-white/40 px-6 py-2.5 text-center text-[11px] text-[#728383]">
          BUP Nest • Secure Campus Portal
        </div>
      </div>
    </div>
  )
}
