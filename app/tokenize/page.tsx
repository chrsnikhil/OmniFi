"use client"

import React from "react"
import { RwaTokenizeForm } from "@/components/rwa-tokenize-form"
import { motion } from "framer-motion"
import { Rocket } from "lucide-react"

export default function TokenizePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Animated Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-12"
          >
            <div className="flex flex-col items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-16 h-16 bg-[#4a90e2] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[8px_8px_0px_0px_#1a2332] mb-2"
              >
                <Rocket className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-6xl font-black text-[#1a2332] font-space-grotesk tracking-wider">
                TOKENIZE <span className="text-[#4a90e2]">RWA</span>
              </h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl text-[#2d3748] font-mono font-bold"
            >
              TRANSFORM REAL-WORLD ASSETS INTO DIGITAL TOKENS
            </motion.p>
          </motion.div>

          {/* Main Form */}
          <RwaTokenizeForm />
        </div>
      </div>
    </div>
  )
}
