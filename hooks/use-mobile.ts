import { useState, useEffect } from 'react'

interface MobileInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  isTouchDevice: boolean
  isIOS: boolean
  isAndroid: boolean
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
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
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
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
      
      // Detect platform
      const userAgent = navigator.userAgent.toLowerCase()
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)
      
      // Detect browser
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)
      const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent)
      const isFirefox = /firefox/.test(userAgent)
      
      setMobileInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        isTouchDevice,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
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

// Utility functions for mobile optimization
export const mobileUtils = {
  // Get appropriate font size based on screen size
  getFontSize: (baseSize: number, mobileRatio: number = 0.9) => {
    const { isMobile } = useMobile()
    return isMobile ? baseSize * mobileRatio : baseSize
  },

  // Get appropriate spacing based on screen size
  getSpacing: (baseSpacing: number, mobileRatio: number = 0.8) => {
    const { isMobile } = useMobile()
    return isMobile ? baseSpacing * mobileRatio : baseSpacing
  },

  // Check if device supports specific features
  supports: {
    webGL: () => {
      try {
        const canvas = document.createElement('canvas')
        return !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
      } catch (e) {
        return false
      }
    },
    
    serviceWorker: () => 'serviceWorker' in navigator,
    
    pushNotifications: () => 'Notification' in window,
    
    geolocation: () => 'geolocation' in navigator,
    
    vibration: () => 'vibrate' in navigator,
    
    battery: () => 'getBattery' in navigator,
    
    deviceMotion: () => 'DeviceMotionEvent' in window,
    
    deviceOrientation: () => 'DeviceOrientationEvent' in window,
  },

  // Get device pixel ratio for high DPI displays
  getPixelRatio: () => window.devicePixelRatio || 1,

  // Check if device is in low power mode (iOS)
  isLowPowerMode: () => {
    if ('getBattery' in navigator) {
      return navigator.getBattery().then(battery => battery.level < 0.2)
    }
    return Promise.resolve(false)
  },

  // Get network information if available
  getNetworkInfo: () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      }
    }
    return null
  },

  // Optimize for mobile performance
  optimizeForMobile: () => {
    const { isMobile, isTouchDevice } = useMobile()
    
    if (isMobile || isTouchDevice) {
      // Reduce animations for better performance
      document.documentElement.style.setProperty('--animation-duration', '0.2s')
      
      // Optimize scrolling
      document.documentElement.style.setProperty('scroll-behavior', 'smooth')
      document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch')
      
      // Prevent zoom on input focus (iOS)
      const inputs = document.querySelectorAll('input, textarea, select')
      inputs.forEach(input => {
        input.setAttribute('style', 'font-size: 16px;')
      })
    }
  },

  // Handle mobile-specific interactions
  handleMobileInteraction: {
    // Prevent double tap zoom
    preventDoubleTapZoom: (element: HTMLElement) => {
      let lastTouchEnd = 0
      element.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime()
        if (now - lastTouchEnd <= 300) {
          event.preventDefault()
        }
        lastTouchEnd = now
      }, false)
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

    // Handle swipe gestures
    handleSwipe: (element: HTMLElement, onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
      let startX = 0
      let startY = 0
      let endX = 0
      let endY = 0

      element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      })

      element.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX
        endY = e.changedTouches[0].clientY
        handleSwipe()
      })

      const handleSwipe = () => {
        const diffX = startX - endX
        const diffY = startY - endY

        // Check if horizontal swipe is more significant than vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          if (diffX > 0 && onSwipeLeft) {
            onSwipeLeft()
          } else if (diffX < 0 && onSwipeRight) {
            onSwipeRight()
          }
        }
      }
    }
  }
}

export default useMobile
