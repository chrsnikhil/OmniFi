"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Zap, Database, Network, Bot, Shield, Rocket } from "lucide-react"

/**
 * OMNIFI DESIGN SYSTEM STYLE GUIDE
 *
 * Use this component as a reference for creating consistent UI elements
 * that match the aesthetic with OmniFi branding.
 */

export default function OmniFiStyleGuide() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px] p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-[#1a2332] font-space-grotesk tracking-wider mb-4">
            OMNIFI DESIGN SYSTEM
          </h1>
          <p className="text-xl text-[#2d3748] font-mono font-bold">STYLE GUIDE & COMPONENT LIBRARY</p>
        </div>

        {/* Color Palette */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332]">COLOR PALETTE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: "PRIMARY BLUE", hex: "#4a90e2", class: "bg-[#4a90e2]" },
                { name: "PURPLE", hex: "#6c5ce7", class: "bg-[#6c5ce7]" },
                { name: "GREEN", hex: "#00b894", class: "bg-[#00b894]" },
                { name: "YELLOW", hex: "#fdcb6e", class: "bg-[#fdcb6e]" },
                { name: "PINK", hex: "#fd79a8", class: "bg-[#fd79a8]" },
                { name: "DARK NAVY", hex: "#1a2332", class: "bg-[#1a2332]" },
                { name: "GRAY", hex: "#2d3748", class: "bg-[#2d3748]" },
                { name: "LIGHT GRAY", hex: "#f5f5f5", class: "bg-[#f5f5f5] border border-gray-300" },
                { name: "WHITE", hex: "#ffffff", class: "bg-white border border-gray-300" },
                { name: "BLACK", hex: "#000000", class: "bg-black" },
              ].map((color) => (
                <div key={color.name} className="text-center">
                  <div
                    className={`w-full h-16 ${color.class} border-2 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] mb-2`}
                  />
                  <p className="text-xs font-bold font-space-grotesk text-[#1a2332]">{color.name}</p>
                  <p className="text-xs font-mono text-[#2d3748]">{color.hex}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332]">TYPOGRAPHY</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-6xl font-black font-space-grotesk text-[#1a2332] tracking-wider">
                  HEADING 1 - SPACE GROTESK BLACK
                </h1>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  text-6xl font-black font-space-grotesk tracking-wider
                </code>
              </div>
              <div>
                <h2 className="text-4xl font-bold font-space-grotesk text-[#1a2332]">Heading 2 - Space Grotesk Bold</h2>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">text-4xl font-bold font-space-grotesk</code>
              </div>
              <div>
                <p className="text-xl font-medium text-[#2d3748]">Body Text - Regular weight for readable content</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">text-xl font-medium text-[#2d3748]</code>
              </div>
              <div>
                <p className="text-sm font-mono font-bold text-[#4a90e2]">TECHNICAL TEXT - JETBRAINS MONO BOLD</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  text-sm font-mono font-bold text-[#4a90e2]
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332]">BUTTONS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              {/* Primary Button */}
              <div className="space-y-2">
                <Button className="bg-[#1a2332] hover:bg-[#2d3748] text-white font-black font-space-grotesk px-8 py-4 border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2] hover:shadow-[12px_12px_0px_0px_#4a90e2] transition-all">
                  <Rocket className="mr-2 h-5 w-5" />
                  PRIMARY BUTTON
                </Button>
                <code className="block text-xs bg-gray-100 p-2 rounded">
                  bg-[#1a2332] border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2]
                </code>
              </div>

              {/* Secondary Button */}
              <div className="space-y-2">
                <Button className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-black font-space-grotesk px-8 py-4 border-4 border-[#4a90e2] shadow-[8px_8px_0px_0px_#1a2332] hover:shadow-[12px_12px_0px_0px_#1a2332] transition-all">
                  <Zap className="mr-2 h-5 w-5" />
                  SECONDARY
                </Button>
                <code className="block text-xs bg-gray-100 p-2 rounded">
                  bg-[#4a90e2] border-4 border-[#4a90e2] shadow-[8px_8px_0px_0px_#1a2332]
                </code>
              </div>

              {/* Outline Button */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="bg-white border-4 border-[#1a2332] text-[#1a2332] hover:bg-gray-100 font-black font-space-grotesk px-8 py-4 shadow-[8px_8px_0px_0px_#4a90e2] hover:shadow-[12px_12px_0px_0px_#4a90e2] transition-all"
                >
                  <Database className="mr-2 h-5 w-5" />
                  OUTLINE
                </Button>
                <code className="block text-xs bg-gray-100 p-2 rounded">
                  bg-white border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2]
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332]">CARDS & CONTAINERS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Feature Card */}
              <div className="space-y-2">
                <Card className="bg-white border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2] hover:shadow-[12px_12px_0px_0px_#4a90e2] transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-16 h-16 bg-[#6c5ce7] border-4 border-[#1a2332] flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332]">
                      <Network className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-[#1a2332] font-space-grotesk">FEATURE CARD</h3>
                    <p className="text-[#2d3748] font-medium">Description text goes here with proper styling.</p>
                  </CardContent>
                </Card>
                <code className="block text-xs bg-gray-100 p-2 rounded">
                  border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2]
                </code>
              </div>

              {/* Dark Card */}
              <div className="space-y-2">
                <Card className="bg-[#1a2332] border-4 border-[#4a90e2] shadow-[8px_8px_0px_0px_#4a90e2]">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-16 h-16 bg-[#00b894] border-4 border-white flex items-center justify-center shadow-[4px_4px_0px_0px_white]">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-white font-space-grotesk">DARK CARD</h3>
                    <p className="text-gray-300 font-medium">White text on dark background variant.</p>
                  </CardContent>
                </Card>
                <code className="block text-xs bg-gray-100 p-2 rounded">
                  bg-[#1a2332] border-4 border-[#4a90e2] shadow-[8px_8px_0px_0px_#4a90e2]
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332]">FORM ELEMENTS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="ENTER TEXT HERE"
                  className="bg-white border-4 border-[#4a90e2] text-[#1a2332] placeholder:text-gray-500 font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] focus:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
                />
                <code className="block text-xs bg-gray-100 p-2 rounded">
                  border-4 border-[#4a90e2] shadow-[4px_4px_0px_0px_#4a90e2]
                </code>
              </div>

              <div className="flex gap-2">
                <Badge className="bg-[#6c5ce7] text-white font-bold font-space-grotesk px-3 py-1 border-2 border-[#1a2332] shadow-[2px_2px_0px_0px_#1a2332]">
                  ACTIVE
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-white border-2 border-[#1a2332] text-[#1a2332] font-bold font-space-grotesk px-3 py-1 shadow-[2px_2px_0px_0px_#4a90e2]"
                >
                  INACTIVE
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3D Effects & Animations */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332]">
              3D EFFECTS & ANIMATIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Floating Animation */}
              <div className="text-center space-y-2">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="w-16 h-16 bg-[#00b894] border-4 border-[#1a2332] mx-auto flex items-center justify-center shadow-[6px_6px_0px_0px_#1a2332]"
                >
                  <Bot className="w-8 h-8 text-white" />
                </motion.div>
                <p className="font-bold font-space-grotesk text-[#1a2332]">FLOATING</p>
                <code className="block text-xs bg-gray-100 p-1 rounded">animate={`{y: [0, -10, 0]}`}</code>
              </div>

              {/* Rotating Animation */}
              <div className="text-center space-y-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-16 h-16 bg-[#fd79a8] border-4 border-[#1a2332] mx-auto flex items-center justify-center shadow-[6px_6px_0px_0px_#1a2332]"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <p className="font-bold font-space-grotesk text-[#1a2332]">ROTATING</p>
                <code className="block text-xs bg-gray-100 p-1 rounded">animate={`{rotate: 360}`}</code>
              </div>

              {/* Pulsing Animation */}
              <div className="text-center space-y-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className="w-16 h-16 bg-[#fdcb6e] border-4 border-[#1a2332] mx-auto flex items-center justify-center shadow-[6px_6px_0px_0px_#1a2332]"
                >
                  <Database className="w-8 h-8 text-white" />
                </motion.div>
                <p className="font-bold font-space-grotesk text-[#1a2332]">PULSING</p>
                <code className="block text-xs bg-gray-100 p-1 rounded">animate={`{scale: [1, 1.1, 1]}`}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSS Classes Reference */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332]">KEY CSS CLASSES</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold font-space-grotesk text-[#1a2332]">BACKGROUNDS</h4>
                <div className="space-y-1 text-sm font-mono">
                  <p>
                    <code>bg-[#f5f5f5]</code> - Light gray background
                  </p>
                  <p>
                    <code>bg-[#1a2332]</code> - Dark navy background
                  </p>
                  <p>
                    <code>bg-[#4a90e2]</code> - Primary blue background
                  </p>
                  <p>
                    <code>
                      bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)]
                      bg-[size:20px_20px]
                    </code>{" "}
                    - Grid pattern
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold font-space-grotesk text-[#1a2332]">SHADOWS & BORDERS</h4>
                <div className="space-y-1 text-sm font-mono">
                  <p>
                    <code>border-4 border-[#1a2332]</code> - Thick dark border
                  </p>
                  <p>
                    <code>shadow-[8px_8px_0px_0px_#4a90e2]</code> - 3D shadow effect
                  </p>
                  <p>
                    <code>shadow-[12px_12px_0px_0px_#4a90e2]</code> - Larger 3D shadow
                  </p>
                  <p>
                    <code>hover:shadow-[16px_16px_0px_0px_#4a90e2]</code> - Hover shadow
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold font-space-grotesk text-[#1a2332]">TYPOGRAPHY</h4>
                <div className="space-y-1 text-sm font-mono">
                  <p>
                    <code>font-space-grotesk</code> - Primary font family
                  </p>
                  <p>
                    <code>font-black</code> - Extra bold weight
                  </p>
                  <p>
                    <code>tracking-wider</code> - Letter spacing
                  </p>
                  <p>
                    <code>font-mono</code> - Monospace for technical text
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold font-space-grotesk text-[#1a2332]">ANIMATIONS</h4>
                <div className="space-y-1 text-sm font-mono">
                  <p>
                    <code>transition-all duration-300</code> - Smooth transitions
                  </p>
                  <p>
                    <code>hover:scale-105</code> - Hover scale effect
                  </p>
                  <p>
                    <code>animate-pulse</code> - Pulsing animation
                  </p>
                  <p>
                    <code>motion.div</code> - Framer Motion component
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
