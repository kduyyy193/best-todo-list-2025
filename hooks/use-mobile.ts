import { useState, useEffect } from 'react'

interface MobileInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  isTouchDevice: boolean
}

export function useMobile(): MobileInfo {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    isTouchDevice: false,
  })

  useEffect(() => {
    const updateMobileInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Detect device type
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024
      
      // Detect orientation
      const orientation = width > height ? 'landscape' : 'portrait'
      
      // Detect touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      setMobileInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        isTouchDevice,
      })
    }

    // Initial detection
    updateMobileInfo()

    // Listen for resize events
    window.addEventListener('resize', updateMobileInfo)
    window.addEventListener('orientationchange', updateMobileInfo)

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateMobileInfo)
      window.removeEventListener('orientationchange', updateMobileInfo)
    }
  }, [])

  return mobileInfo
}

// Simple mobile utilities
export const mobileUtils = {
  // Optimize for mobile performance
  optimizeForMobile: () => {
    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input, textarea, select')
    inputs.forEach(input => {
      input.setAttribute('style', 'font-size: 16px;')
    })
  },

  // Add haptic feedback if supported
  hapticFeedback: (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100]
      }
      navigator.vibrate(patterns[type])
    }
  },
}

export default useMobile
