# 🎨 OMNIFI Design System Documentation

## Overview
The OmniFi design system is inspired by the **Sui Overflow aesthetic** with a **cell-shaded, 3D visual style** that combines bold colors, thick borders, and dramatic shadows to create a unique, game-like interface.

---

## 🎯 Core Design Principles

### 1. **Cell-Shaded Aesthetic**
- **Thick borders** (3-4px) on all elements
- **Flat colors** with minimal gradients
- **Hard shadows** instead of soft blur effects
- **Bold, geometric shapes**

### 2. **3D Visual Depth**
- **Box shadows** that simulate 3D depth: `shadow-[8px_8px_0px_0px_#color]`
- **Layered elements** with different shadow depths
- **Perspective transforms** on hover states
- **Isometric-style** illustrations

### 3. **Interactive Responsiveness**
- **Hover animations** that enhance the 3D effect
- **Scale transforms** combined with shadow changes
- **Color transitions** on interactive elements
- **Micro-animations** for feedback

---

## 🎨 Color Palette

\`\`\`css
/* Primary Colors */
--primary-blue: #4a90e2;
--primary-purple: #6c5ce7;
--primary-green: #00b894;
--primary-yellow: #fdcb6e;
--primary-pink: #fd79a8;

/* Neutral Colors */
--dark-navy: #1a2332;
--medium-gray: #2d3748;
--light-gray: #f5f5f5;
--white: #ffffff;
--black: #000000;

/* Darker Variants (for hover states) */
--purple-dark: #5a4fcf;
--green-dark: #00a085;
--yellow-dark: #e17055;
--pink-dark: #e84393;
--blue-dark: #357abd;
\`\`\`

---

## 🔧 Key CSS Classes & Utilities

### **3D Shadow System**
\`\`\`css
/* Basic 3D Shadow */
.shadow-3d-sm { box-shadow: 4px 4px 0px 0px #4a90e2; }
.shadow-3d-md { box-shadow: 8px 8px 0px 0px #4a90e2; }
.shadow-3d-lg { box-shadow: 12px 12px 0px 0px #4a90e2; }

/* Interactive 3D Shadows */
.shadow-3d-hover:hover { 
  box-shadow: 12px 12px 0px 0px #4a90e2;
  transform: translate(-4px, -4px);
}
\`\`\`

### **Border System**
\`\`\`css
/* Thick Borders */
.border-thick { border: 3px solid #1a2332; }
.border-extra-thick { border: 4px solid #1a2332; }

/* Colored Borders */
.border-blue { border: 3px solid #4a90e2; }
.border-purple { border: 3px solid #6c5ce7; }
\`\`\`

### **Typography**
\`\`\`css
/* Font Weights */
.font-black { font-weight: 900; }
.font-bold { font-weight: 700; }

/* Font Families */
.font-space-grotesk { font-family: 'Space Grotesk', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

/* Letter Spacing */
.tracking-wider { letter-spacing: 0.05em; }
.tracking-widest { letter-spacing: 0.1em; }
\`\`\`

---

## 🎭 Animation Patterns

### **Floating Animation**
\`\`\`css
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
\`\`\`

### **3D Hover Effects**
\`\`\`css
.hover-3d {
  transition: all 0.3s ease;
  transform: translate(0, 0);
}

.hover-3d:hover {
  transform: translate(-4px, -4px) rotateX(5deg) rotateY(5deg);
  box-shadow: 16px 16px 0px 0px #4a90e2;
}
\`\`\`

### **Color Cycling**
\`\`\`css
@keyframes color-cycle {
  0% { background-color: #4a90e2; }
  25% { background-color: #6c5ce7; }
  50% { background-color: #00b894; }
  75% { background-color: #fd79a8; }
  100% { background-color: #4a90e2; }
}

.animate-color-cycle {
  animation: color-cycle 4s linear infinite;
}
\`\`\`

---

## 🧩 Component Patterns

### **Interactive Card Template**
\`\`\`tsx
function InteractiveCard({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -8,
        rotateX: 5,
        rotateY: 5,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`transform-gpu perspective-1000 ${className}`}
    >
      <Card className="bg-white border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2] hover:shadow-[12px_12px_0px_0px_#4a90e2] transition-all duration-300">
        {children}
      </Card>
    </motion.div>
  )
}
\`\`\`

### **3D Button Template**
\`\`\`tsx
function Button3D({ children, color = "#4a90e2", darkColor = "#357abd" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="font-bold px-6 py-3 border-3 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[6px_6px_0px_0px_#1a2332] transition-all duration-200"
      style={{ backgroundColor: color }}
      whileHover={{ backgroundColor: darkColor }}
    >
      {children}
    </motion.button>
  )
}
\`\`\`

### **Floating Element Template**
\`\`\`tsx
function FloatingElement({ children, delay = 0 }) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 2, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
\`\`\`

---

## 🎪 Layout Patterns

### **Modular Grid System**
\`\`\`tsx
// Inspired by Sui Overflow's modular layout
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[800px]">
  {/* Hero Card - Large */}
  <div className="lg:col-span-7 lg:row-span-2">
    <InteractiveCard>
      {/* Main content */}
    </InteractiveCard>
  </div>
  
  {/* Stats Card - Medium */}
  <div className="lg:col-span-5">
    <InteractiveCard>
      {/* Stats content */}
    </InteractiveCard>
  </div>
  
  {/* Feature Cards - Small */}
  <div className="lg:col-span-5">
    <InteractiveCard>
      {/* Feature content */}
    </InteractiveCard>
  </div>
</div>
\`\`\`

### **Background Grid Pattern**
\`\`\`css
.grid-bg {
  background-image: 
    linear-gradient(#4a90e2 1px, transparent 1px),
    linear-gradient(90deg, #4a90e2 1px, transparent 1px);
  background-size: 20px 20px;
}
\`\`\`

---

## 🎨 Implementation Checklist

### ✅ **Essential Elements**
- [ ] Thick borders (3-4px) on all interactive elements
- [ ] 3D box shadows with no blur
- [ ] Bold, high-contrast colors
- [ ] Hover animations that enhance 3D effect
- [ ] Floating/breathing animations on decorative elements
- [ ] Grid background pattern
- [ ] Bold typography with wide letter spacing

### ✅ **Interactive States**
- [ ] Hover: Scale + shadow increase + color change
- [ ] Active: Scale down + shadow decrease
- [ ] Focus: Enhanced shadow + color shift
- [ ] Loading: Progressive animations

### ✅ **Animation Principles**
- [ ] Smooth easing curves: `[0.25, 0.1, 0.25, 1]`
- [ ] Staggered entrance animations
- [ ] Continuous subtle movements (floating, rotating)
- [ ] Color cycling on accent elements
- [ ] Parallax effects on scroll

---

## 🚀 Quick Start Template

\`\`\`tsx
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function OmniFiStyleComponent() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px] p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2] max-w-md mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-black text-[#1a2332] font-space-grotesk tracking-wider">
              OMNIFI STYLE
            </h2>
            <p className="text-[#2d3748]">
              This follows the OmniFi design system principles.
            </p>
            <Button className="bg-[#6c5ce7] hover:bg-[#5a4fcf] text-white font-bold px-6 py-3 border-3 border-[#1a2332] shadow-[6px_6px_0px_0px_#1a2332] hover:shadow-[8px_8px_0px_0px_#1a2332] transition-all duration-200">
              Get Started
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
\`\`\`

---

## 🎯 Pro Tips

1. **Always use thick borders** - They're essential for the cell-shaded look
2. **Layer your shadows** - Multiple shadow depths create visual hierarchy
3. **Animate everything** - Even subtle movements bring the interface to life
4. **Bold typography** - Use font-weight 700+ for all important text
5. **High contrast** - Don't be afraid of bold color combinations
6. **Grid everything** - The background grid ties the whole aesthetic together

This design system creates a **unique, game-like interface** that stands out while remaining highly functional and accessible! 🎮✨
