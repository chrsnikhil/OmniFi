"use client"

import React from "react"
import { RwaTokenizeForm } from "@/components/rwa-tokenize-form"
import { motion } from "framer-motion"
import { Leaf, ArrowRight, Database, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function TokenizePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-[#00b894] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[6px_6px_0px_0px_#1a2332]"
              >
                <Database className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <h1 className="text-5xl font-black text-[#1a2332] font-space-grotesk tracking-wider mb-4">
              TOKENIZE RWA
            </h1>
            <p className="text-xl text-[#2d3748] font-mono font-bold mb-6">
              TRANSFORM REAL-WORLD ASSETS INTO DIGITAL TOKENS
            </p>
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { icon: Leaf, title: "CARBON CREDITS", desc: "Environmental assets" },
                { icon: Coins, title: "PRECIOUS METALS", desc: "Gold & silver" },
                { icon: Database, title: "REAL ESTATE", desc: "Property assets" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <Card className="bg-white border-2 border-[#4a90e2] shadow-[4px_4px_0px_0px_#4a90e2]">
                    <CardContent className="p-4 text-center">
                      <item.icon className="w-6 h-6 text-[#4a90e2] mx-auto mb-2" />
                      <h3 className="font-bold font-space-grotesk text-[#1a2332] text-sm">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#2d3748] font-mono">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-black font-space-grotesk px-6 py-3 border-4 border-[#4a90e2] rounded-none shadow-[6px_6px_0px_0px_#1a2332] hover:shadow-[8px_8px_0px_0px_#1a2332] transition-all"
                >
                  <a href="/vault">
                    DEPOSIT TO VAULT
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* RWA Tokenize Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <RwaTokenizeForm />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
