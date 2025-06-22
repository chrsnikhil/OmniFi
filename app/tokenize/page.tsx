"use client"

import React from "react"
import { RwaTokenizeForm } from "@/components/rwa-tokenize-form"

export default function TokenizePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-[#1a2332] font-space-grotesk tracking-wider mb-4">
              TOKENIZE RWA
            </h1>
            <p className="text-xl text-[#2d3748] font-mono font-bold">
              TRANSFORM REAL-WORLD ASSETS INTO DIGITAL TOKENS
            </p>
          </div>

          {/* Main Form */}
          <RwaTokenizeForm />
        </div>
      </div>
    </div>
  )
}
