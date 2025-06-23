"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Bot, BarChart3, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<null | string>(null);
  const [rebalancing, setRebalancing] = useState<null | string>(null);

  // Simulate fetching analysis from ElizaOS
  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    setRebalancing(null);
    // Simulate API call delay
    setTimeout(() => {
      setAnalysis(
        "The market is currently stable with low volatility. No immediate rebalancing is required. However, keep an eye on the volatility index as it approaches the threshold."
      );
      setRebalancing(
        "Rebalancing is only recommended if volatility exceeds 5% or if there are at least 3 price updates. Your vault is currently within safe parameters."
      );
      setLoading(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 bg-[#4a90e2] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[8px_8px_0px_0px_#1a2332]"
          >
            <Bot className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-[#1a2332] font-space-grotesk tracking-wider">
            AI Insights
          </h1>
        </div>

        {/* AI Analysis Card */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader className="flex flex-row items-center gap-4">
            <BarChart3 className="w-8 h-8 text-[#4a90e2]" />
            <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332]">
              AI Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-black font-space-grotesk px-8 py-3 border-4 border-[#4a90e2] shadow-[8px_8px_0px_0px_#1a2332] hover:shadow-[12px_12px_0px_0px_#1a2332] transition-all flex items-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin w-5 h-5" /> Analyzing...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" /> Run Analysis
                </>
              )}
            </Button>
            {analysis && (
              <div className="mt-4 p-4 bg-[#f5f5f5] border-2 border-[#4a90e2] rounded-lg shadow-[4px_4px_0px_0px_#4a90e2] text-[#1a2332] font-medium">
                {analysis}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rebalancing Insights Card */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2]">
          <CardHeader className="flex flex-row items-center gap-4">
            <Rocket className="w-8 h-8 text-[#4a90e2]" />
            <CardTitle className="text-xl font-black font-space-grotesk text-[#1a2332]">
              Rebalancing Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rebalancing ? (
              <div className="p-4 bg-[#f5f5f5] border-2 border-[#4a90e2] rounded-lg shadow-[4px_4px_0px_0px_#4a90e2] text-[#1a2332] font-medium">
                {rebalancing}
              </div>
            ) : (
              <div className="text-[#2d3748] font-mono">Run analysis to see rebalancing insights.</div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for future ElizaOS agent output */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#6c5ce7]">
          <CardHeader className="flex flex-row items-center gap-4">
            <Bot className="w-8 h-8 text-[#6c5ce7]" />
            <CardTitle className="text-xl font-black font-space-grotesk text-[#1a2332]">
              ElizaOS Agent Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[#2d3748] font-mono">
              {/* This is where you will display detailed agent output, thoughts, and recommendations from ElizaOS. */}
              Coming soon: Real-time AI agent feedback, memory, and recommendations.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 