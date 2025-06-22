"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { usePrivy } from "@privy-io/react-auth"
import { motion } from "framer-motion"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  Coins, 
  Leaf, 
  Mountain, 
  Zap, 
  CheckCircle,
  AlertCircle,
  Loader2,
  User
} from "lucide-react"
import { toast } from "sonner"

// Form validation schema
const rwaFormSchema = z.object({
  assetType: z.string().min(1, "Asset type is required"),
  assetId: z.string().min(3, "Asset ID must be at least 3 characters").max(50, "Asset ID must be less than 50 characters"),
  assetName: z.string().min(2, "Asset name must be at least 2 characters").max(100, "Asset name must be less than 100 characters"),
  value: z.number().min(0.01, "Value must be greater than 0").max(1000000, "Value must be reasonable"),
  unit: z.string().min(1, "Unit is required"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  certificationId: z.string().max(100, "Certification ID must be less than 100 characters").optional(),
})

type RwaFormData = z.infer<typeof rwaFormSchema>

// Asset type options with icons and colors
const assetTypes = [
  {
    id: "carbon-credit",
    name: "Carbon Credit",
    icon: Leaf,
    color: "bg-green-500",
    description: "Verified carbon offset certificates"
  },
  {
    id: "gold",
    name: "Gold",
    icon: Coins,
    color: "bg-yellow-500",
    description: "Precious metal reserves"
  },
  {
    id: "real-estate",
    name: "Real Estate",
    icon: Mountain,
    color: "bg-blue-500",
    description: "Property and land assets"
  },
  {
    id: "renewable-energy",
    name: "Renewable Energy",
    icon: Zap,
    color: "bg-purple-500",
    description: "Solar, wind, and clean energy assets"
  }
]

export function RwaTokenizeForm() {
  const { ready, authenticated, login, user, logout } = usePrivy()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssetType, setSelectedAssetType] = useState<string>("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<RwaFormData>({
    resolver: zodResolver(rwaFormSchema),
    defaultValues: {
      assetType: "",
      assetId: "",
      assetName: "",
      value: 0,
      unit: "",
      description: "",
      location: "",
      certificationId: ""
    }
  })

  const watchedAssetType = watch("assetType")

  // Handle form submission
  const onSubmit = async (data: RwaFormData) => {
    if (!authenticated) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call - replace with actual contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("RWA Data to tokenize:", data)
      
      toast.success(`Successfully submitted ${data.assetName} for tokenization!`)
      
      // Reset form after successful submission
      reset()
      setSelectedAssetType("")
      
    } catch (error) {
      console.error("Error tokenizing RWA:", error)
      toast.error("Failed to tokenize asset. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle asset type selection
  const handleAssetTypeSelect = (value: string) => {
    setSelectedAssetType(value)
    setValue("assetType", value)
    
    // Auto-populate some fields based on asset type
    const assetType = assetTypes.find(type => type.id === value)
    if (assetType) {
      switch (value) {
        case "carbon-credit":
          setValue("unit", "tCO2e")
          break
        case "gold":
          setValue("unit", "oz")
          break
        case "real-estate":
          setValue("unit", "sqft")
          break
        case "renewable-energy":
          setValue("unit", "kWh")
          break
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Wallet Connection Card */}
      <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
        <CardHeader>
          <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332] flex items-center gap-3">
            <Wallet className="h-8 w-8" />
            WALLET CONNECTION
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#4a90e2]" />
              <span className="ml-3 text-lg font-mono font-bold text-[#2d3748]">
                LOADING WALLET...
              </span>
            </div>
          ) : !authenticated ? (
            <div className="text-center space-y-6">
              <div className="text-lg text-[#2d3748] font-mono font-bold">
                CONNECT YOUR WALLET TO TOKENIZE RWA
              </div>
              <Button 
                onClick={login}
                className="bg-[#1a2332] hover:bg-[#2d3748] text-white font-black font-space-grotesk px-8 py-4 border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2] hover:shadow-[12px_12px_0px_0px_#4a90e2] transition-all"
              >
                <Wallet className="mr-2 h-5 w-5" />
                CONNECT WALLET
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-[#f5f5f5] rounded-lg border-2 border-[#4a90e2]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-mono font-bold text-[#1a2332]">WALLET CONNECTED</div>
                  <div className="text-sm text-[#2d3748] font-mono">
                    {user?.wallet?.address ? 
                      `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 
                      'Connected'
                    }
                  </div>
                </div>
              </div>
              <Button 
                onClick={logout}
                variant="outline"
                className="bg-white border-2 border-[#1a2332] text-[#1a2332] hover:bg-gray-100 font-black font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2]"
              >
                DISCONNECT
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Type Selection */}
      <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
        <CardHeader>
          <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332]">
            SELECT ASSET TYPE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assetTypes.map((assetType) => {
              const Icon = assetType.icon
              const isSelected = watchedAssetType === assetType.id
              
              return (
                <motion.div
                  key={assetType.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all border-3 ${
                      isSelected 
                        ? 'border-[#4a90e2] shadow-[8px_8px_0px_0px_#4a90e2] bg-blue-50' 
                        : 'border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[8px_8px_0px_0px_#1a2332]'
                    }`}
                    onClick={() => handleAssetTypeSelect(assetType.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${assetType.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black font-space-grotesk text-[#1a2332] text-lg">
                            {assetType.name}
                          </h3>
                          <p className="text-sm text-[#2d3748] font-mono">
                            {assetType.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-6 w-6 text-[#4a90e2]" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
          {errors.assetType && (
            <div className="flex items-center gap-2 mt-3 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-mono font-bold">{errors.assetType.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RWA Details Form */}
      <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
        <CardHeader>
          <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332]">
            ASSET DETAILS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset ID */}
              <div className="space-y-2">
                <Label htmlFor="assetId" className="text-lg font-black font-space-grotesk text-[#1a2332]">
                  ASSET ID *
                </Label>
                <Input
                  id="assetId"
                  {...register("assetId")}
                  placeholder="e.g., CC-2024-001"
                  className="bg-white border-4 border-[#4a90e2] text-[#1a2332] placeholder:text-gray-500 font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] focus:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
                />
                {errors.assetId && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-mono font-bold">{errors.assetId.message}</span>
                  </div>
                )}
              </div>

              {/* Asset Name */}
              <div className="space-y-2">
                <Label htmlFor="assetName" className="text-lg font-black font-space-grotesk text-[#1a2332]">
                  ASSET NAME *
                </Label>
                <Input
                  id="assetName"
                  {...register("assetName")}
                  placeholder="e.g., Amazon Rainforest Credits"
                  className="bg-white border-4 border-[#4a90e2] text-[#1a2332] placeholder:text-gray-500 font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] focus:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
                />
                {errors.assetName && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-mono font-bold">{errors.assetName.message}</span>
                  </div>
                )}
              </div>

              {/* Value */}
              <div className="space-y-2">
                <Label htmlFor="value" className="text-lg font-black font-space-grotesk text-[#1a2332]">
                  VALUE *
                </Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  {...register("value", { valueAsNumber: true })}
                  placeholder="e.g., 100.50"
                  className="bg-white border-4 border-[#4a90e2] text-[#1a2332] placeholder:text-gray-500 font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] focus:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
                />
                {errors.value && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-mono font-bold">{errors.value.message}</span>
                  </div>
                )}
              </div>

              {/* Unit */}
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-lg font-black font-space-grotesk text-[#1a2332]">
                  UNIT *
                </Label>
                <Input
                  id="unit"
                  {...register("unit")}
                  placeholder="e.g., tCO2e, oz, sqft"
                  className="bg-white border-4 border-[#4a90e2] text-[#1a2332] placeholder:text-gray-500 font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] focus:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
                />
                {errors.unit && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-mono font-bold">{errors.unit.message}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-lg font-black font-space-grotesk text-[#1a2332]">
                  LOCATION
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="e.g., Brazil, Amazon Basin"
                  className="bg-white border-4 border-[#4a90e2] text-[#1a2332] placeholder:text-gray-500 font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] focus:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
                />
                {errors.location && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-mono font-bold">{errors.location.message}</span>
                  </div>
                )}
              </div>

              {/* Certification ID */}
              <div className="space-y-2">
                <Label htmlFor="certificationId" className="text-lg font-black font-space-grotesk text-[#1a2332]">
                  CERTIFICATION ID
                </Label>
                <Input
                  id="certificationId"
                  {...register("certificationId")}
                  placeholder="e.g., VCS-1234, ISO-14001"
                  className="bg-white border-4 border-[#4a90e2] text-[#1a2332] placeholder:text-gray-500 font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] focus:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
                />
                {errors.certificationId && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-mono font-bold">{errors.certificationId.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-black font-space-grotesk text-[#1a2332]">
                DESCRIPTION
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Provide additional details about the asset..."
                rows={4}
                className="bg-white border-4 border-[#4a90e2] text-[#1a2332] placeholder:text-gray-500 font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] focus:shadow-[6px_6px_0px_0px_#4a90e2] transition-all resize-none"
              />
              {errors.description && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-mono font-bold">{errors.description.message}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t-2 border-[#f5f5f5]">
              <Button
                type="submit"
                disabled={!authenticated || isSubmitting}
                className="w-full bg-[#1a2332] hover:bg-[#2d3748] text-white font-black font-space-grotesk px-8 py-6 text-xl border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2] hover:shadow-[12px_12px_0px_0px_#4a90e2] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    TOKENIZING ASSET...
                  </>
                ) : (
                  <>
                    <Coins className="mr-3 h-6 w-6" />
                    TOKENIZE RWA
                  </>
                )}
              </Button>
              
              {!authenticated && (
                <p className="text-center text-sm text-[#2d3748] font-mono font-bold mt-3">
                  Please connect your wallet to tokenize assets
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
