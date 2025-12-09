import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Excel Files Online - Free Visual Diff Tool (No Sign-up)',
  description: 'Instantly spot differences between two Excel spreadsheets. Side-by-side comparison, smart highlighting, and 100% private (client-side). No VLOOKUP needed.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayoutWrapper({ children }: RootLayoutProps) {
  return (
    <html>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX81JCNDTH"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JX81JCNDTH');
          `
        }} />

        {/* Microsoft Clarity */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uhirhqqg9s");
          `
        }} />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}