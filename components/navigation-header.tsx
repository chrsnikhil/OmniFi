"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, Rocket, Zap, Database, Coins, Target } from "lucide-react"
import { useRouter } from "next/navigation"

export function NavigationHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const navItems = [
    { label: "HOME", href: "/", icon: Home },
    { label: "TOKENIZE", href: "/tokenize", icon: Coins },
    { label: "VAULT", href: "/vault", icon: Rocket },
    { label: "TRANSFER", href: "/transfer", icon: Zap },
    { label: "TOKENS", href: "/tokens", icon: Database },
    { label: "CONTRACTS", href: "/contracts", icon: Target },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMenuOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a2332] border-b-4 border-[#4a90e2] shadow-[0_4px_0px_0px_#4a90e2] sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation("/")}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-[#4a90e2] border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_0px_white]">
              <span className="text-white font-black text-sm">O</span>
            </div>
            <span className="text-white font-black font-space-grotesk text-xl tracking-wider">
              OMNI<span className="text-[#4a90e2]">FI</span>
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <motion.div key={item.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation(item.href)}
                  className="text-white hover:bg-[#4a90e2] hover:text-white font-bold font-space-grotesk px-4 py-2 border-2 border-transparent hover:border-white shadow-none hover:shadow-[2px_2px_0px_0px_white] transition-all"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 bg-[#4a90e2] border-2 border-white shadow-[2px_2px_0px_0px_white] transition-all"
          >
            <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMenuOpen ? "auto" : 0,
            opacity: isMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2 border-t-2 border-[#4a90e2]">
            {navItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isMenuOpen ? 1 : 0, 
                  x: isMenuOpen ? 0 : -20 
                }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation(item.href)}
                  className="w-full justify-start text-white hover:bg-[#4a90e2] hover:text-white font-bold font-space-grotesk px-4 py-3 border-2 border-transparent hover:border-white shadow-none hover:shadow-[2px_2px_0px_0px_white] transition-all"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
