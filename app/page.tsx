'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Zap, BarChart3, Shield, Copy, Check, Globe } from 'lucide-react'

export default function Home() {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [shortened, setShortened] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    
    setLoading(true)
    setError(null)
    setShortened(null)
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customCode: customCode || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to shorten URL')
      } else if (data.shortCode) {
        setShortened(data)
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    const fullUrl = `${window.location.origin}/${shortened.shortCode}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 bg-hero opacity-50 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center p-2 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Nexus<span className="text-purple-500">URL</span></span>
        </div>
        <div className="flex gap-8 items-center">
            <a href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Dashboard</a>
            <button
              onClick={() => document.getElementById('url-forge')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors"
            >
              Get Started
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-40 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-4 py-1.5 rounded-full glass text-xs font-medium text-purple-400 border border-purple-500/20 inline-block mb-6">
            Meet the New Standard of Shortlinks
          </span>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
            Build <span className="text-gradient">Faster</span> Connections.
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            The world's most advanced URL infrastructure. Built with Snowflake IDs, Edge-level redirects, and real-time analytics.
          </p>
        </motion.div>

        {/* Input Forge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative max-w-2xl mx-auto"
        >
          <form id="url-forge" onSubmit={handleShorten} className="p-2 rounded-2xl glass border border-white/10 flex flex-col gap-2">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long URL here..."
                  className="w-full bg-transparent border-none focus:ring-0 pl-12 pr-4 py-4 text-white placeholder:text-zinc-600 rounded-xl"
                />
              </div>
              <div className="w-full md:w-48 relative group border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-2">
                <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm pointer-events-none">/</div>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                  placeholder="custom-alias"
                  maxLength={20}
                  className="w-full bg-transparent border-none focus:ring-0 pl-8 pr-4 py-4 text-white placeholder:text-zinc-600 rounded-xl font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Shorten <Zap className="w-4 h-4 fill-current" /></>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-left"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Card */}
          <AnimatePresence>
            {shortened && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="mt-6 p-6 rounded-2xl glass border border-purple-500/30 bg-purple-500/5 text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-zinc-500 mb-1 uppercase tracking-widest font-bold">Your Shortened URL</p>
                    <p className="text-xl font-mono font-semibold truncate text-purple-300">
                      {window.location.origin}/{shortened.shortCode}
                    </p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    <span className="text-sm font-bold">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features Graph */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl mx-auto">
          {[
            { icon: Zap, title: "Edge Redirects", desc: "Sub-50ms latency powered by Vercel Edge Middleware." },
            { icon: BarChart3, title: "Deep Analytics", desc: "Track every click, location, and device in real-time." },
            { icon: Shield, title: "Snowflake IDs", desc: "100% collision-free distributed unique ID generation." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="p-8 rounded-3xl glass-card text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 transition-all">
                <feature.icon className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  )
}
