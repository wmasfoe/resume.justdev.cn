import { getLocaleOnServer } from '@/i18n/server'
import { Metadata } from 'next'
import Script from 'next/script'

import './styles/globals.css'
import './styles/markdown.scss'

export const metadata: Metadata = {
  title: '李嘉奇的个人简历 | 前端开发工程师',
  description: '富有经验的前端开发工程师，专注于React、Vue、TypeScript和现代前端技术栈。拥有丰富的Web应用开发经验，热衷于创造优秀的用户体验。',
  keywords: 'React, Vue, TypeScript, 前端开发, Web开发, JavaScript, Next.js',
  authors: [{ name: '李嘉奇' }],
  openGraph: {
    title: '李嘉奇的个人简历 | 前端开发工程师',
    description: '富有经验的前端开发工程师，专注于React、Vue、TypeScript和现代前端技术栈。拥有丰富的Web应用开发经验，热衷于创造优秀的用户体验。',
    type: 'website',
    locale: 'zh_CN',
    siteName: '李嘉奇的个人简历',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '李嘉奇的个人简历',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-tap-highlight': 'no',
    'mobile-web-app-capable': 'yes',
  },
}

const LocaleLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const locale = getLocaleOnServer()
  return (
    <html lang={locale ?? 'en'} className="h-full">
      <body className="h-full">
        <Script
          id="schema-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'http://schema.org',
              '@type': 'Person',
              name: '李嘉奇',
              jobTitle: '前端开发工程师',
              url: 'https://resume.xhub.xin',
              sameAs: [
                'https://github.com/wsasfoe',
              ]
            })
          }}
        />
        <div className="w-screen h-screen min-w-[300px]">
          {children}
        </div>
      </body>
    </html>
  )
}

export default LocaleLayout
