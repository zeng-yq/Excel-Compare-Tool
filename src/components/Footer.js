'use client'

// components/Footer.js
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { i18n, addLocaleToPath } from '@/lib/i18n-config';

export function Footer() {
  const pathname = usePathname();

  // Extract current locale from pathname
  const getCurrentLocale = () => {
    for (const locale of i18n.locales) {
      if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
        return locale;
      }
    }
    return i18n.defaultLocale; // fallback to default locale
  };

  const currentLocale = getCurrentLocale();

  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href={addLocaleToPath('/', currentLocale)} className="flex items-center space-x-2 mb-4">
              <svg t="1764768146372" className="icon h-8 w-8" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15307" width="256" height="256">
                <path d="M776.704 985.6H247.296c-84.48 0-153.6-69.12-153.6-154.112V189.952C93.696 105.472 162.816 35.84 247.296 35.84h378.88c40.96 0 79.36 18.944 104.448 50.688L901.12 303.616c18.432 23.552 28.672 52.736 28.672 82.432v444.928c0.512 84.992-68.608 154.624-153.088 154.624z" fill="#E9F6F3" p-id="15308"></path>
                <path d="M776.704 1021.44H247.296c-104.448 0-189.44-84.992-189.44-189.952V189.952C57.856 84.992 142.848 0 247.296 0h378.88c52.224 0 100.352 23.552 132.608 64.512L929.28 281.6c23.552 29.696 36.352 66.56 36.352 104.96v444.928c0.512 104.96-84.48 189.952-188.928 189.952zM247.296 71.68c-65.024 0-117.76 52.736-117.76 118.272v641.536c0 65.024 52.736 118.272 117.76 118.272h528.896c65.024 0 117.76-52.736 117.76-118.272V386.56c0-21.504-7.168-43.008-20.992-60.416l-170.496-217.088c-18.432-23.552-46.592-36.864-76.288-36.864 0-0.512-378.88-0.512-378.88-0.512z" fill="#A3DBCC" p-id="15309"></path>
                <path d="M595.456 749.056l-86.528-128-86.528 128H314.368l140.8-195.072-130.56-188.928h107.52l76.8 123.904 76.288-123.904h107.52l-130.56 188.928 140.8 195.072z" fill="#20A884" p-id="15310"></path>
              </svg>
              <span className="inline-block font-bold">
                <span className="text-gray-700">Excel</span>
                <span style={{ color: '#20A884' }}>Compare</span>
              </span>
            </Link>
            <p className="text-base text-gray-500">
              Excel Compare: Free, secure spreadsheet comparison with synchronized scrolling and instant diff highlighting. Processed locally, no installation required.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href={addLocaleToPath('/', currentLocale)} className="text-base text-gray-500 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link href={addLocaleToPath('/posts', currentLocale)} className="text-base text-gray-500 hover:text-gray-900">
                  Articles
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="mailto:support@excelcompare.org" className="text-base text-gray-500 hover:text-gray-900">
                  support@excelcompare.org
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Excel Compare. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href={addLocaleToPath('/privacy-policy', currentLocale)}
                className="text-base text-gray-400 hover:text-gray-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href={addLocaleToPath('/terms-of-service', currentLocale)}
                className="text-base text-gray-400 hover:text-gray-600 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}