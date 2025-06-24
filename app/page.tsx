"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Zap,
  Database,
  Network,
  TrendingUp,
  Bot,
  Globe,
  ArrowRight,
  Menu,
  X,
  Target,
  Activity,
  Star,
  Sparkles,
  Rocket,
  Github,
  MessageCircle,
  Shield,
  BarChart3,
  Users,
  CheckCircle,
  Wallet,
  Settings,
  Coins,
  RefreshCw,
} from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from "next/navigation"

// Cell-shaded animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
}

const float = { y: [0, -8, 0] };
const floatTransition = { duration: 4, repeat: Number.POSITIVE_INFINITY };

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 3
        if (newProgress >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 200)
          return 100
        }
        return newProgress
      })
    }, 50)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-none border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2] max-w-md w-full mx-4"
      >
        <div className="text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: [0, 0, 1, 1] }}
            className="w-16 h-16 bg-[#4a90e2] border-4 border-[#1a2332] rounded-none flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#1a2332]"
          >
            <Rocket className="w-8 h-8 text-white" />
          </motion.div>

          <div>
            <h1 className="text-3xl font-black text-[#1a2332] font-space-grotesk tracking-wider">OMNIFI</h1>
            <p className="text-[#4a90e2] font-bold text-sm font-mono">LOADING PROTOCOL...</p>
          </div>

          <div className="space-y-3">
            <div className="w-full h-4 bg-[#f5f5f5] border-2 border-[#1a2332] rounded-none overflow-hidden">
              <motion.div
                className="h-full bg-[#4a90e2] rounded-none"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-[#1a2332] font-bold font-mono">{progress}%</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const headerY = useTransform(scrollY, [0, 100], [0, -5])

  // Privy wallet connection
  const { login, logout, ready, authenticated, user } = usePrivy()

  return (
    <motion.header style={{ y: headerY }} className="bg-[#1a2332] border-b-4 border-[#4a90e2] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-4 group cursor-pointer">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: [0, 0, 1, 1] }}
              className="w-12 h-12 bg-[#4a90e2] border-4 border-white rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_white]"
            >
              <Rocket className="w-6 h-6 text-white" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-black text-white font-space-grotesk tracking-wider">OMNIFI</h1>
              <p className="text-[#4a90e2] font-bold text-xs font-mono">PROTOCOL V3.0</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {[
              { name: "PROTOCOL", color: "#4a90e2", href: "/contracts" },
              { name: "FEATURES", color: "#6c5ce7", href: "/vault" },
              { name: "TECH", color: "#00b894", href: "/tokens" },
              { name: "TOKENIZE", color: "#fd79a8", href: "/tokenize" },
              { name: "DEMO", color: "#fdcb6e", href: "/transfer" },
            ].map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white border-4 border-[#1a2332] text-[#1a2332] font-black font-space-grotesk text-sm hover:bg-[#f5f5f5] transition-colors duration-200 shadow-[4px_4px_0px_0px_#4a90e2] hover:shadow-[6px_6px_0px_0px_#4a90e2]"
                style={{ borderColor: item.color }}
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-black font-space-grotesk px-6 py-3 border-4 border-[#1a2332] rounded-none shadow-[4px_4px_0px_0px_white] hover:shadow-[6px_6px_0px_0px_white] transition-all duration-200">
                <a href="/tokenize">
                  <Target className="w-4 h-4 mr-2" />
                  LAUNCH APP
                </a>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {/* Wallet Connect Button */}
              {ready ? (
                authenticated ? (
                  <div className="flex items-center space-x-2">
                    <span className="bg-white border-4 border-[#4a90e2] text-[#4a90e2] font-black font-space-grotesk px-4 py-2 rounded-none shadow-[4px_4px_0px_0px_#4a90e2] text-xs">
                      {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                    </span>
                    <Button
                      variant="outline"
                      className="bg-white border-4 border-[#fdcb6e] text-[#fdcb6e] hover:bg-[#f5f5f5] font-black font-space-grotesk px-4 py-2 rounded-none shadow-[4px_4px_0px_0px_#fdcb6e] hover:shadow-[6px_6px_0px_0px_#fdcb6e] transition-all duration-200 text-xs"
                      onClick={logout}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="bg-white border-4 border-[#4a90e2] text-[#4a90e2] hover:bg-[#f5f5f5] font-black font-space-grotesk px-6 py-3 rounded-none shadow-[4px_4px_0px_0px_#4a90e2] hover:shadow-[6px_6px_0px_0px_#4a90e2] transition-all duration-200"
                    onClick={login}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    CONNECT
                  </Button>
                )
              ) : (
                <Button
                  variant="outline"
                  className="bg-white border-4 border-[#4a90e2] text-[#4a90e2] font-black font-space-grotesk px-6 py-3 rounded-none shadow-[4px_4px_0px_0px_#4a90e2] opacity-50 cursor-not-allowed"
                  disabled
                >
                  Loading...
                </Button>
              )}
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 bg-[#4a90e2] border-4 border-white rounded-none shadow-[4px_4px_0px_0px_white] transition-all duration-200"
          >
            <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </motion.div>
          </motion.button>
        </div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between text-xs font-bold bg-[#4a90e2] border-4 border-white rounded-none p-3 mt-4 font-mono"
        >
          <div className="flex items-center space-x-6">
            {[
              { label: "ONLINE", color: "#00b894", icon: Globe },
              { label: "SECURED", color: "#fdcb6e", icon: Shield },
              { label: "MULTI-CHAIN", color: "#fd79a8", icon: Network },
            ].map((status, i) => (
              <div key={status.label} className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.3 }}
                  className="w-3 h-3 rounded-none border-2 border-white"
                  style={{ backgroundColor: status.color }}
                />
                <status.icon className="w-4 h-4 text-white" />
                <span className="text-white">{status.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            {/* Removed: <span className="text-white">BLOCK: #892,341</span> */}
            {/* Removed: <span className="text-[#00b894]">TVL: $50.2M</span> */}
          </div>
        </motion.div>
      </div>
    </motion.header>
  )
}

function FloatingElement({
  children,
  delay = 0,
  className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div animate={float} transition={{ ...floatTransition, delay }} className={className}>
      {children}
    </motion.div>
  )
}

function CellShadedCard({
  children,
  className = "",
  color = "#4a90e2",
}: { children: React.ReactNode; className?: string; color?: string }) {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -4,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card
        className="bg-white border-4 border-[#1a2332] rounded-none shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:shadow-[12px_12px_0px_0px_var(--shadow-color)] transition-all duration-200"
        style={{ "--shadow-color": color } as React.CSSProperties}
      >
        {children}
      </Card>
    </motion.div>
  )
}

export default function OmniFiLanding() {
  const [loading, setLoading] = useState(true)
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const router = useRouter()

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px] overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <motion.section style={{ y: heroY }} className="pt-6 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[800px]">
            {/* Main Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7 h-full flex flex-col"
            >
              <CellShadedCard color="#4a90e2" className="h-full flex flex-col">
                <CardContent className="p-8 h-full flex flex-col justify-between relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,#4a90e2_25%,transparent_25%),linear-gradient(-45deg,#4a90e2_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#4a90e2_75%),linear-gradient(-45deg,transparent_75%,#4a90e2_75%)] bg-[size:20px_20px] opacity-10" />

                  <div className="space-y-8 relative z-10">
                    <div className="flex items-center space-x-4">
                      <FloatingElement>
                        <div className="w-12 h-12 bg-[#fdcb6e] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332]">
                          <Star className="w-6 h-6 text-[#1a2332]" />
                        </div>
                      </FloatingElement>
                      <p className="text-[#1a2332] font-black text-lg font-space-grotesk tracking-wider">
                        NEXT-GEN DEFI PROTOCOL
                      </p>
                    </div>

                    <div className="space-y-4">
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-6xl lg:text-8xl font-black text-[#1a2332] font-space-grotesk tracking-wider leading-none"
                      >
                        OMNI
                        <span className="block text-[#4a90e2]">FI</span>
                      </motion.h1>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="flex items-center space-x-4"
                      >
                        <div className="w-8 h-8 bg-[#6c5ce7] border-4 border-[#1a2332] rounded-none" />
                        <p className="text-2xl font-black text-[#1a2332] font-space-grotesk tracking-wider">PROTOCOL</p>
                      </motion.div>
                    </div>

                    <p className="text-[#2d3748] text-xl font-bold max-w-md leading-relaxed font-mono">
                      BUILD NEXT-GENERATION DEFI APPLICATIONS WITH AUTONOMOUS YIELD OPTIMIZATION AND REAL-WORLD ASSET
                      INTEGRATION.
                    </p>
                  </div>

                  {/* Floating 3D Elements */}
                  <FloatingElement delay={0.5} className="absolute top-20 right-20">
                    <div className="w-16 h-16 bg-[#fd79a8] border-4 border-[#1a2332] rounded-none transform rotate-12 shadow-[4px_4px_0px_0px_#1a2332]" />
                  </FloatingElement>

                  <FloatingElement delay={1} className="absolute bottom-32 right-12">
                    <div className="w-12 h-12 bg-[#00b894] border-4 border-[#1a2332] rounded-none transform -rotate-12 shadow-[4px_4px_0px_0px_#1a2332]" />
                  </FloatingElement>

                  {/* Preserve card height after removing main hero card buttons for alignment */}
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 relative z-10 min-h-[56px]" />
                </CardContent>
              </CellShadedCard>
            </motion.div>

            {/* Right Column: Protocol Stats + Key Features */}
            <div className="lg:col-span-5 h-full flex flex-col">
              {/* Protocol Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <CellShadedCard color="#00b894">
                  <CardContent className="p-6 relative overflow-hidden">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <FloatingElement>
                          <div className="w-12 h-12 bg-[#00b894] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332]">
                            <BarChart3 className="w-6 h-6 text-white" />
                          </div>
                        </FloatingElement>
                        <h3 className="text-[#1a2332] font-black text-xl font-space-grotesk tracking-wider">
                          PROTOCOL STATS
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "CONTRACTS", value: "5+", color: "#00b894" },
                          { label: "DEPLOYMENT", value: "Fuji Testnet", color: "#4a90e2" },
                          { label: "CHAINS", value: "3", color: "#6c5ce7" },
                          { label: "APY", value: "4.2%", color: "#fdcb6e" },
                        ].map((stat, i) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="text-center p-4 bg-white border-4 border-[#1a2332] rounded-none shadow-[4px_4px_0px_0px_var(--stat-color)]"
                            style={{ "--stat-color": stat.color } as React.CSSProperties}
                          >
                            <p className="text-2xl font-black text-[#1a2332] font-space-grotesk">{stat.value}</p>
                            <p className="text-[#2d3748] text-sm font-bold font-mono">{stat.label}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CellShadedCard>
              </motion.div>

              {/* Key Features Card (flex-grow to bottom align) */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex-1 flex flex-col justify-end mt-6"
              >
                <CellShadedCard color="#6c5ce7" className="h-full flex flex-col">
                  <CardContent className="p-6 space-y-6 bg-[#6c5ce7] text-white flex flex-col justify-between h-full">
                    <div className="flex items-center space-x-4">
                      <FloatingElement>
                        <div className="w-12 h-12 bg-white border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332]">
                          <Sparkles className="w-6 h-6 text-[#6c5ce7]" />
                        </div>
                      </FloatingElement>
                      <h3 className="text-white font-black text-xl font-space-grotesk tracking-wider">KEY FEATURES</h3>
                    </div>

                    <div className="space-y-4">
                      {[
                        { icon: Database, text: "RWA INTEGRATION", color: "#fdcb6e" },
                        { icon: Bot, text: "VOLATILITY BASED OPTIMIZATION", color: "#00b894" },
                        { icon: Shield, text: "MULTI-CHAIN SECURITY", color: "#fd79a8" },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          className="flex items-center space-x-4"
                        >
                          <div
                            className="w-8 h-8 border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[2px_2px_0px_0px_#1a2332]"
                            style={{ backgroundColor: item.color }}
                          >
                            <item.icon className="w-4 h-4 text-[#1a2332]" />
                          </div>
                          <p className="text-white font-bold font-mono">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </CellShadedCard>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Vault CTA Section */}
      <motion.section className="px-6 relative">
        <div className="max-w-4xl mx-auto">
          <CellShadedCard color="#00b894">
            <CardContent className="p-8 bg-[#00b894] text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%),linear-gradient(-45deg,rgba(255,255,255,0.1)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(255,255,255,0.1)_75%),linear-gradient(-45deg,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[size:30px_30px]" />
              
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-8 relative z-10">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-4">
                    <FloatingElement>
                      <div className="w-12 h-12 bg-[#00b894] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332]">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                    </FloatingElement>
                    <h3 className="text-2xl font-black text-[#1a2332] font-space-grotesk tracking-wider">Explore OmniFi</h3>
                  </div>
                  <p className="text-[#2d3748] text-lg font-bold font-mono leading-relaxed">
                    OmniFi is a next-generation DeFi protocol offering:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-[#2d3748] font-mono text-base">
                    <li>Tokenize real-world assets (RWA) for on-chain utility</li>
                    <li>AI-powered yield optimization and automation</li>
                    <li>Cross-chain transfers for seamless asset movement</li>
                    <li>Dynamic vaults with risk-aware rebalancing</li>
                    <li>Transparent contract access and analytics</li>
                  </ul>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button asChild className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-black font-space-grotesk px-4 py-2 border-2 border-[#1a2332] rounded-none shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[6px_6px_0px_0px_#1a2332] transition-all">
                      <a href="/tokenize">Tokenize Assets</a>
                    </Button>
                    <Button asChild className="bg-[#00b894] hover:bg-[#00a085] text-white font-black font-space-grotesk px-4 py-2 border-2 border-[#1a2332] rounded-none shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[6px_6px_0px_0px_#1a2332] transition-all">
                      <a href="/vault">Vault Dashboard</a>
                    </Button>
                    <Button asChild className="bg-[#6c5ce7] hover:bg-[#5a4fcf] text-white font-black font-space-grotesk px-4 py-2 border-2 border-[#1a2332] rounded-none shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[6px_6px_0px_0px_#1a2332] transition-all">
                      <a href="/tokens">Your Tokens</a>
                    </Button>
                    <Button asChild className="bg-[#fdcb6e] hover:bg-[#e17055] text-[#1a2332] font-black font-space-grotesk px-4 py-2 border-2 border-[#1a2332] rounded-none shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[6px_6px_0px_0px_#1a2332] transition-all">
                      <a href="/transfer">Cross-Chain Transfer</a>
                    </Button>
                    <Button asChild className="bg-white hover:bg-gray-100 text-[#1a2332] font-black font-space-grotesk px-4 py-2 border-2 border-[#1a2332] rounded-none shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[6px_6px_0px_0px_#1a2332] transition-all col-span-1 sm:col-span-2">
                      <a href="/contracts">View Contracts</a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <FloatingElement delay={1} className="absolute top-4 right-8">
                <div className="w-8 h-8 bg-[#fdcb6e] border-4 border-[#1a2332] rounded-none transform rotate-12 shadow-[2px_2px_0px_0px_#1a2332]" />
              </FloatingElement>
              
              <FloatingElement delay={1.5} className="absolute bottom-4 left-8">
                <div className="w-6 h-6 bg-[#fd79a8] border-4 border-[#1a2332] rounded-none transform -rotate-12 shadow-[2px_2px_0px_0px_#1a2332]" />
              </FloatingElement>
            </CardContent>
          </CellShadedCard>
        </div>
      </motion.section>

      {/* Risk-Aware Rebalancing Section */}
      <AnimatedSection className="py-16 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <CellShadedCard color="#4a90e2">
            <CardContent className="p-8 bg-white text-[#1a2332] relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,#4a90e2_10%,transparent_10%),linear-gradient(-45deg,#4a90e2_10%,transparent_10%),linear-gradient(45deg,transparent_90%,#4a90e2_90%),linear-gradient(-45deg,transparent_90%,#4a90e2_90%)] bg-[size:30px_30px] opacity-5 pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center space-x-4 mb-2">
                  <FloatingElement>
                    <div className="w-12 h-12 bg-[#4a90e2] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332]">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </FloatingElement>
                  <h2 className="text-3xl font-black font-space-grotesk tracking-wider">RISK-AWARE REBALANCING</h2>
                </div>
                <p className="text-lg font-bold font-mono text-[#2d3748]">OmniFi's rebalancing is <span className="text-[#4a90e2]">"risk-aware"</span> because it doesn't just blindly move tokens around—it checks how wild the market is (using something called a <span className="text-[#6c5ce7]">volatility index</span>) to decide when to act. Volatility is like a measure of how much prices are jumping up and down. If prices are too crazy (high volatility), it's riskier to keep your tokens in certain places, so OmniFi adjusts them to protect your money.</p>
                <div className="bg-[#f5f5f5] border-4 border-[#1a2332] shadow-[4px_4px_0px_0px_#4a90e2] p-6 rounded-none">
                  <h3 className="text-xl font-black font-space-grotesk mb-4 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-[#4a90e2]" /> What OmniFi Does:</h3>
                  <ul className="list-none space-y-4 pl-0">
                    <li className="flex items-start gap-3">
                      <span className="mt-1"><Database className="w-5 h-5 text-[#6c5ce7]" /></span>
                      <span className="font-mono text-[#2d3748] font-bold">Tracks the price of a mock carbon credit <span className="text-[#4a90e2]">(using Chainlink Data Feeds, like ETH/USD as a stand-in)</span>.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1"><Activity className="w-5 h-5 text-[#00b894]" /></span>
                      <span className="font-mono text-[#2d3748] font-bold">Calculates a simple volatility index <span className="text-[#6c5ce7]">(how much the price has wiggled recently)</span>.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1"><RefreshCw className="w-5 h-5 text-[#fdcb6e]" /></span>
                      <span className="font-mono text-[#2d3748] font-bold">If the market gets too volatile <span className="text-[#fdcb6e]">(e.g., price swings more than 5%)</span>, it "rebalances" by moving your tokens to a safer or better spot <span className="text-[#fd79a8]">()</span>.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1"><Star className="w-5 h-5 text-[#4a90e2]" /></span>
                      <span className="font-mono text-[#2d3748] font-bold">This makes OmniFi smarter than a basic vault that only chases the highest yield without considering risk.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </CellShadedCard>
        </div>
      </AnimatedSection>

      {/* How It Works Section */}
      <AnimatedSection className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div variants={staggerContainer} className="text-center mb-16">
            <motion.div variants={scaleIn} className="flex justify-center mb-8">
              <FloatingElement>
                <div className="w-20 h-20 bg-[#fd79a8] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[8px_8px_0px_0px_#1a2332]">
                  <Settings className="w-10 h-10 text-[#1a2332]" />
                </div>
              </FloatingElement>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl lg:text-6xl font-black text-[#1a2332] mb-6 font-space-grotesk tracking-wider"
            >
              HOW IT WORKS
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-[#2d3748] max-w-3xl mx-auto font-bold font-mono">
              SIMPLE STEPS TO START EARNING WITH OMNIFI'S AUTONOMOUS DEFI PROTOCOL
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "CONNECT WALLET",
                description: "Link your Web3 wallet to access the OmniFi protocol and start your DeFi journey and Protect your assets ",
                icon: Wallet,
                color: "#4a90e2",
              },
              {
                step: "02",
                title: "DEPOSIT ASSETS",
                description: "Deposit your crypto assets or real-world assets to begin earning optimized yields.",
                icon: TrendingUp,
                color: "#00b894",
              },
              {
                step: "03",
                title: "AI OPTIMIZATION",
                description:
                  "Our AI agents automatically optimize your portfolio across multiple chains and protocols.",
                icon: Bot,
                color: "#6c5ce7",
              },
              {
                step: "04",
                title: "EARN REWARDS",
                description: "Watch your assets grow with automated yield farming and cross-chain arbitrage all while protecting your assets",
                icon: Star,
                color: "#fdcb6e",
              },
            ].map((step, index) => (
              <motion.div key={index} variants={scaleIn}>
                <CellShadedCard color={step.color}>
                  <CardContent className="p-6 space-y-6 text-center h-full flex flex-col">
                    {/* Step Number */}
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: [0, 0, 1, 1] }}
                        className="w-16 h-16 border-4 border-[#1a2332] rounded-none mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332] relative"
                        style={{ backgroundColor: step.color }}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#1a2332] border-2 border-white rounded-none flex items-center justify-center text-xs font-black text-white font-mono">
                        {step.step}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 flex-1">
                      <h3 className="text-xl font-black text-[#1a2332] font-space-grotesk tracking-wider">
                        {step.title}
                      </h3>
                      <p className="text-[#2d3748] leading-relaxed font-bold text-sm font-mono">{step.description}</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex justify-center space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            backgroundColor: i <= index ? step.color : "#e5e7eb",
                          }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.2 + i * 0.1,
                          }}
                          className="w-3 h-3 border-2 border-[#1a2332] rounded-none"
                        />
                      ))}
                    </div>

                    {/* Arrow to next step */}
                    {index < 3 && (
                      <motion.div
                        animate={{ x: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: [0, 0, 1, 1] }}
                        className="hidden lg:block absolute -right-6 top-1/2 transform -translate-y-1/2"
                      >
                        <ArrowRight className="w-8 h-8 text-[#1a2332]" />
                      </motion.div>
                    )}
                  </CardContent>
                </CellShadedCard>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div variants={fadeInUp} className="text-center mt-16">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                asChild
                className="bg-[#1a2332] hover:bg-[#2d3748] text-white font-black font-space-grotesk px-12 py-6 text-xl border-4 border-[#1a2332] rounded-none shadow-[12px_12px_0px_0px_#4a90e2] hover:shadow-[16px_16px_0px_0px_#4a90e2] transition-all duration-200"
              >
                <a href="/vault">
                  <Rocket className="mr-4 h-8 w-8" />
                  START EARNING NOW
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Team Section */}
      <AnimatedSection className="py-20 px-6 bg-[#1a2332] relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div variants={staggerContainer} className="text-center mb-16">
            <motion.div variants={scaleIn} className="flex justify-center mb-8">
              <FloatingElement>
                <div className="w-20 h-20 bg-[#fd79a8] border-4 border-white rounded-none flex items-center justify-center shadow-[8px_8px_0px_0px_white]">
                  <Users className="w-10 h-10 text-[#1a2332]" />
                </div>
              </FloatingElement>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl lg:text-6xl font-black text-white mb-6 font-space-grotesk tracking-wider"
            >
              MEET THE TEAM
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-[#4a90e2] max-w-3xl mx-auto font-bold font-mono">
              EXPERIENCED BUILDERS FROM TOP DEFI PROTOCOLS AND TRADITIONAL FINANCE
            </motion.p>
          </motion.div>

          {/* Team Cards */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
              {[
                {
                  name: "CHRIS NIKHIL FERNANDO",
                  role: "DEVELOPER",
                  experience: "STUDENT",
                  color: "#e74c3c",
                  avatar: "CF",
                  github: "https://github.com/chrsnikhil",
                },
                {
                  name: "ADITYA",
                  role: "DEVELOPER",
                  experience: "STUDENT",
                  color: "#4a90e2",
                  avatar: "AD",
                  github: "https://github.com/alienworld1",
                },
              ].map((member, index) => (
                <motion.div key={index} variants={scaleIn} className="flex justify-center">
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      y: -8,
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-sm"
                  >
                    <Card className="bg-white border-4 border-[#4a90e2] rounded-none shadow-[12px_12px_0px_0px_#4a90e2] hover:shadow-[16px_16px_0px_0px_#4a90e2] transition-all duration-200 h-full">
                      <CardContent className="p-8 text-center space-y-6">
                        {/* Avatar */}
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: [0, 0, 1, 1] }}
                            className="w-24 h-24 border-4 border-[#1a2332] rounded-none mx-auto flex items-center justify-center shadow-[6px_6px_0px_0px_#1a2332] text-white font-black text-2xl font-space-grotesk"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.avatar}
                          </motion.div>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: [0, 0, 1, 1] }}
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#00b894] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332]"
                          >
                            <CheckCircle className="w-5 h-5 text-white" />
                          </motion.div>
                        </div>

                        {/* Info */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-black text-[#1a2332] leading-tight font-space-grotesk tracking-wider">
                            {member.name}
                          </h3>
                          <div
                            className="inline-block px-4 py-2 border-4 border-[#1a2332] rounded-none text-sm font-black text-white font-mono shadow-[4px_4px_0px_0px_#1a2332]"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.role}
                          </div>
                          <p className="text-sm text-[#2d3748] font-bold font-mono">{member.experience}</p>
                        </div>

                        {/* Social Links */}
                        <div className="flex justify-center space-x-4 pt-4">
                          <motion.a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 bg-[#1a2332] border-4 border-[#1a2332] rounded-none flex items-center justify-center cursor-pointer shadow-[4px_4px_0px_0px_#4a90e2] hover:shadow-[6px_6px_0px_0px_#4a90e2] transition-all duration-200"
                          >
                            <Github className="w-6 h-6 text-white" />
                          </motion.a>
                          <motion.div
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 bg-[#6c5ce7] border-4 border-[#1a2332] rounded-none flex items-center justify-center cursor-pointer shadow-[4px_4px_0px_0px_#4a90e2] hover:shadow-[6px_6px_0px_0px_#4a90e2] transition-all duration-200"
                          >
                            <MessageCircle className="w-6 h-6 text-white" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={staggerContainer} className="text-center mb-16">
            <motion.div variants={scaleIn} className="flex justify-center mb-8">
              <FloatingElement>
                <div className="w-20 h-20 bg-[#6c5ce7] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[8px_8px_0px_0px_#1a2332]">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </FloatingElement>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl lg:text-6xl font-black text-[#1a2332] mb-6 font-space-grotesk tracking-wider"
            >
              PROTOCOL FEATURES
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-[#2d3748] font-bold font-mono">
              NEXT-GENERATION DEFI INFRASTRUCTURE BUILT FOR THE FUTURE
            </motion.p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "RWA TOKENIZATION",
                description: "Convert real-world assets into blockchain tokens with full compliance.",
                color: "#6c5ce7",
                icon: Database,
              },
              {
                title: "AI-POWERED AGENTS",
                description: "Intelligent algorithms optimize yield strategies automatically.",
                color: "#00b894",
                icon: Bot,
              },
              {
                title: "CROSS-CHAIN FLOW",
                description: "Move assets across chains to capture best opportunities all while being safe",
                color: "#fdcb6e",
                icon: Network,
              },
              {
                title: "CHAINLINK AUTOMATION",
                description: "Reliable automation ensures flawless execution and maximize yield ",
                color: "#fd79a8",
                icon: Zap,
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={scaleIn}>
                <CellShadedCard color={feature.color} className="h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-6">
                      <FloatingElement delay={index * 0.2}>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: [0, 0, 1, 1] }}
                          className="w-14 h-14 border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332]"
                          style={{ backgroundColor: feature.color }}
                        >
                          <feature.icon className="w-7 h-7 text-white" />
                        </motion.div>
                      </FloatingElement>
                      <div className="w-8 h-8 bg-[#1a2332] border-2 border-[#1a2332] rounded-none flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-4">
                      <h3 className="text-lg font-black text-[#1a2332] font-space-grotesk tracking-wider">
                        {feature.title}
                      </h3>
                      <p className="text-[#2d3748] leading-relaxed font-bold text-sm font-mono">
                        {feature.description}
                      </p>
                    </div>

                    {/* Footer Section */}
                    <div className="flex justify-center space-x-2 mt-6">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            backgroundColor: [feature.color, "#e5e7eb", feature.color],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.5,
                          }}
                          className="w-3 h-3 border-2 border-[#1a2332] rounded-none"
                        />
                      ))}
                    </div>
                  </CardContent>
                </CellShadedCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-20 px-6 bg-[#1a2332] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <motion.div variants={staggerContainer} className="space-y-8">
            <motion.div variants={scaleIn} className="flex justify-center">
              <FloatingElement>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: [0, 0, 1, 1] }}
                  className="w-24 h-24 bg-[#4a90e2] border-4 border-white rounded-none flex items-center justify-center shadow-[12px_12px_0px_0px_white]"
                >
                  <Rocket className="w-12 h-12 text-white" />
                </motion.div>
              </FloatingElement>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-4xl lg:text-6xl font-black text-white font-space-grotesk tracking-wider"
            >
              START EARNING WITH
              <span className="block text-[#4a90e2] mt-4">OMNIFI</span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-xl text-[#4a90e2] max-w-3xl mx-auto font-bold font-mono">
              JOIN THE REVOLUTION AND BE AMONG THE FIRST TO EXPERIENCE AUTONOMOUS DEFI POWERED BY REAL-WORLD ASSETS.
            </motion.p>
          </motion.div>

          <motion.div variants={staggerContainer} className="flex justify-center">
            <motion.div variants={scaleIn}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="bg-white border-4 border-[#4a90e2] text-[#1a2332] hover:bg-[#f5f5f5] font-black font-space-grotesk px-12 py-6 text-xl rounded-none shadow-[12px_12px_0px_0px_#4a90e2] hover:shadow-[16px_16px_0px_0px_#4a90e2] transition-all duration-200"
                  asChild
                >
                  <a href="https://github.com/chrsnikhil/OmniFi" target="_blank" rel="noopener noreferrer">
                    <Github className="h-8 w-8 mr-4" />
                    VIEW ON GITHUB
                  </a>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeInUp} className="flex justify-center space-x-12 pt-8">
            {[
              { label: "SMART CONTRACTS", value: "5+", color: "#00b894" },
              { label: "CODE COMMITS", value: "100+", color: "#4a90e2" },
              { label: "RWA TOKENS", value: "5", color: "#6c5ce7" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <FloatingElement delay={index * 0.2}>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: [0, 0, 1, 1] }}
                    className="w-12 h-12 border-4 border-white rounded-none mx-auto mb-3 flex items-center justify-center shadow-[6px_6px_0px_0px_white]"
                    style={{ backgroundColor: stat.color }}
                  >
                    <span className="text-white font-black text-lg font-mono">{index + 1}</span>
                  </motion.div>
                </FloatingElement>
                <p className="text-2xl font-black font-space-grotesk tracking-wider" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-white font-bold text-sm font-mono">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  )
}
