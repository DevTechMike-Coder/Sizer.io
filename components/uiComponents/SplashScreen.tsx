"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, TrendingUp, Sparkles } from "lucide-react";

interface SplashScreenProps {
  finishLoading?: () => void;
  duration?: number; // duration in ms
}

export default function SplashScreen({
  finishLoading,
  duration = 2200,
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        if (finishLoading) finishLoading();
      }}
    >
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(8px)",
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background select-none overflow-hidden"
        >
          {/* Ambient Background Glow Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-transparent blur-[120px] dark:opacity-20"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.1, scale: 1.1 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 blur-[140px] dark:opacity-15"
            />
            {/* Subtle Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
            {/* Animated Logo Mark */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative mb-6"
            >
              <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-foreground/5 border border-foreground/10 shadow-2xl backdrop-blur-md dark:bg-foreground/[0.03]">
                {/* Glowing ring animation */}
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500/30 via-transparent to-blue-500/30 blur-[2px] -z-10"
                />
                
                {/* Center Icon */}
                <div className="relative flex items-center justify-center">
                  <Shield className="w-9 h-9 text-emerald-500 dark:text-emerald-400 stroke-[2.2]" />
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="absolute"
                  >
                    <TrendingUp className="w-5 h-5 text-foreground stroke-[2.5]" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* App Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
              className="space-y-2"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/[0.04] border border-foreground/10 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                  Trading Intelligence
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-foreground/75 bg-clip-text text-transparent font-sans">
                Sizer<span className="text-emerald-500">.io</span>
              </h1>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                className="text-base sm:text-lg font-medium text-muted-foreground tracking-normal"
              >
                Risk Management Made Easy
              </motion.h2>
            </motion.div>

            {/* Animated Progress / Loading bar */}
            <motion.div
              initial={{ opacity: 0, width: "0%" }}
              animate={{ opacity: 1, width: "160px" }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-10 h-1 bg-foreground/10 rounded-full overflow-hidden relative"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{
                  duration: (duration - 400) / 1000,
                  ease: [0.65, 0, 0.35, 1],
                }}
                className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}