import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vietnamese Todo App - Quản lý công việc với Timer',
  description: 'Ứng dụng Todo List tiếng Việt với timer countdown, thông báo âm thanh, và xuất báo cáo. Quản lý công việc hiệu quả với giao diện đẹp và dễ sử dụng.',
  keywords: 'todo app, vietnamese, timer, countdown, quản lý công việc, productivity, pomodoro, task management',
  authors: [{ name: 'Vietnamese Todo App Team' }],
  creator: 'Vietnamese Todo App',
  publisher: 'Vietnamese Todo App',
  generator: 'Next.js',
  applicationName: 'Vietnamese Todo App',
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
    title: 'Vietnamese Todo App - Quản lý công việc với Timer',
    description: 'Ứng dụng Todo List tiếng Việt với timer countdown, thông báo âm thanh, và xuất báo cáo. Quản lý công việc hiệu quả với giao diện đẹp và dễ sử dụng.',
    url: 'https://vietnamese-todo-app.vercel.app',
    siteName: 'Vietnamese Todo App',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vietnamese Todo App - Quản lý công việc với Timer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vietnamese Todo App - Quản lý công việc với Timer',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vietnamese Todo App" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Vietnamese Todo App",
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
                "name": "Vietnamese Todo App Team"
              },
              "featureList": [
                "Timer countdown",
                "Âm thanh thông báo",
                "Xuất báo cáo",
                "Giao diện tiếng Việt",
                "Quản lý công việc theo ngày"
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
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
