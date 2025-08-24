import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'The best Todo App 2025 - Quản lý công việc với Timer',
  description: 'Ứng dụng Todo List tiếng Việt với timer countdown, thông báo âm thanh, và xuất báo cáo. Quản lý công việc hiệu quả với giao diện đẹp và dễ sử dụng.',
  keywords: 'todo app, vietnamese, timer, countdown, quản lý công việc, productivity, pomodoro, task management',
  authors: [{ name: 'The best Todo App 2025 Team' }],
  creator: 'The best Todo App 2025',
  publisher: 'The best Todo App 2025',
  generator: 'Next.js',
  applicationName: 'The best Todo App 2025',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://vietnamese-todo-app.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'The best Todo App 2025 - Quản lý công việc với Timer',
    description: 'Ứng dụng Todo List tiếng Việt với timer countdown, thông báo âm thanh, và xuất báo cáo. Quản lý công việc hiệu quả với giao diện đẹp và dễ sử dụng.',
    url: 'https://vietnamese-todo-app.vercel.app',
    siteName: 'The best Todo App 2025',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The best Todo App 2025 - Quản lý công việc với Timer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The best Todo App 2025 - Quản lý công việc với Timer',
    description: 'Ứng dụng Todo List tiếng Việt với timer countdown, thông báo âm thanh, và xuất báo cáo.',
    images: ['/og-image.png'],
    creator: '@vietnamese_todo_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="The best Todo App 2025" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "The best Todo App 2025",
              "description": "Ứng dụng Todo List tiếng Việt với timer countdown, thông báo âm thanh, và xuất báo cáo",
              "url": "https://vietnamese-todo-app.vercel.app",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "The best Todo App 2025 Team"
              },
              "featureList": [
                "Timer countdown",
                "Âm thanh thông báo",
                "Xuất báo cáo",
                "Giao diện tiếng Việt",
                "Quản lý công việc theo ngày",
                "Responsive design"
              ]
            })
          }}
        />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}

/* Mobile optimizations */
@media (max-width: 640px) {
  html {
    font-size: 14px;
  }
  
  /* Prevent horizontal scroll on mobile */
  body {
    overflow-x: hidden;
  }
  
  /* Better touch targets */
  button, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Improve input readability on mobile */
  input, textarea, select {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Safe area for devices with notches */
@supports (padding: max(0px)) {
  .safe-area-top {
    padding-top: max(1rem, env(safe-area-inset-top));
  }
  
  .safe-area-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
  
  .safe-area-left {
    padding-left: max(1rem, env(safe-area-inset-left));
  }
  
  .safe-area-right {
    padding-right: max(1rem, env(safe-area-inset-right));
  }
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
