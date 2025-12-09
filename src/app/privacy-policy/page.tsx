// Privacy Policy page - Default English version
import { Metadata } from 'next'
import { NavigationWrapper } from '@/components/NavigationWrapper'
import { FooterWrapper } from '@/components/FooterWrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Privacy Policy - Excel Compare',
    description: 'Privacy Policy for Excel Compare - Learn how we collect, use, and protect your information.',
    alternates: {
      canonical: 'https://excelcompare.org/privacy-policy'
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
  }
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <NavigationWrapper locale="en" />
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: December 4, 2025</p>

        <p className="text-gray-700 mb-6">
          Welcome to Excel Compare. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website and free Excel comparison services.
        </p>

        <p className="text-gray-700 mb-8">
          By using Excel Compare, you agree to the practices described in this policy.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
        <p className="text-gray-700 mb-4">
          We collect the minimum amount of information necessary to provide our services:
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">User-Provided Content:</h3>
            <p className="text-gray-700">When you use our comparison tool, we process the Excel files and data you upload. If you contact us via email, we collect your email address and the content of your message.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Technical Data:</h3>
            <p className="text-gray-700">We automatically collect standard internet log information, such as your IP address, browser type, device information, and operating system.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Usage Data:</h3>
            <p className="text-gray-700">We collect anonymous data about how you interact with our site (e.g., pages visited, time spent) to help us improve user experience.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">
          We use your information solely for the following purposes:
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">To Provide Services:</h3>
            <p className="text-gray-700">To process and compare the documents you upload.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">To Improve Our Site:</h3>
            <p className="text-gray-700">We use analytics to understand site traffic and optimize performance.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">To Communicate:</h3>
            <p className="text-gray-700">To respond to your support requests or inquiries.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Legal Compliance:</h3>
            <p className="text-gray-700">To comply with legal obligations or protect against fraud.</p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-800">
            <strong>Note on Uploaded Files:</strong> We do not use the content of your uploaded Excel files for marketing purposes. They are processed strictly to generate the comparison results.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Data Sharing and Disclosure</h2>
        <p className="text-gray-700 mb-4">
          We do not sell or rent your personal information to third parties. We may share information only in the following limited circumstances:
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Service Providers:</h3>
            <p className="text-gray-700">We engage trusted third-party vendors (such as hosting providers and analytics services like Google Analytics) to assist in operating our website. They have access to data only as needed to perform their functions.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Legal Requirements:</h3>
            <p className="text-gray-700">We may disclose information if required by law, subpoena, or to protect our rights and safety.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Cookies</h2>
        <p className="text-gray-700 mb-4">
          We use cookies and similar technologies to enhance your experience and gather usage data.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Functional Cookies:</h3>
            <p className="text-gray-700">Essential for the website to work correctly.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Analytics Cookies:</h3>
            <p className="text-gray-700">Help us understand how visitors use our site.</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          You can control or disable cookies through your browser settings, though this may affect some site functionality.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Security</h2>
        <p className="text-gray-700 mb-6">
          We implement reasonable security measures to protect your data from unauthorized access, alteration, or disclosure. However, please be aware that no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. International Data Transfer</h2>
        <p className="text-gray-700 mb-6">
          Our servers and service providers may be located in various jurisdictions. By using our service, you acknowledge that your data may be transferred to and processed in countries outside your own, which may have different data protection laws.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
        <p className="text-gray-700 mb-6">
          Depending on your location, you may have the right to access, correct, or delete the personal information we hold about you. To exercise these rights, please contact us.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Changes to This Policy</h2>
        <p className="text-gray-700 mb-6">
          We may update this Privacy Policy from time to time. The specific date of the last update will be listed at the top of this page. Your continued use of the site constitutes acceptance of any changes.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
        <p className="text-gray-700 mb-6">
          If you have any questions or concerns regarding this Privacy Policy, please contact us at: <a href="mailto:support@excelcompare.org" className="text-blue-600 hover:text-blue-800 underline">support@excelcompare.org</a>
        </p>
      </div>
        </div>
      </main>
      <FooterWrapper locale="en" />
    </div>
  )
}