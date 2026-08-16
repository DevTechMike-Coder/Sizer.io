"use client";

import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";

interface SplashScreenWrapperProps {
  children: React.ReactNode;
  duration?: number;
  showOncePerSession?: boolean;
}

export default function SplashScreenWrapper({
  children,
  duration = 2000,
  showOncePerSession = false,
}: SplashScreenWrapperProps) {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    if (showOncePerSession) {
      const hasSeenSplash = sessionStorage.getItem("sizer_splash_shown");
      if (hasSeenSplash) {
        setShowSplash(false);
      }
    }
  }, [showOncePerSession]);

  const handleFinishLoading = () => {
    if (showOncePerSession) {
      sessionStorage.setItem("sizer_splash_shown", "true");
    }
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && (
        <SplashScreen
          duration={duration}
          finishLoading={handleFinishLoading}
        />
      )}
      <div
        className={`w-full min-h-screen transition-opacity duration-500 ${
          showSplash && !isMounted ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}
