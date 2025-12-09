// Terms of Service page - Default English version
import { Metadata } from 'next'
import { NavigationWrapper } from '@/components/NavigationWrapper'
import { FooterWrapper } from '@/components/FooterWrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Terms of Service - Excel Compare',
    description: 'Terms of Service for Excel Compare - Learn about our terms and conditions for using our website and services.',
    alternates: {
      canonical: 'https://excelcompare.org/terms-of-service'
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
  }
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <NavigationWrapper locale="en" />
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last Revised: December 4, 2025</p>

        <p className="text-gray-700 mb-6">
          Welcome to Excel Compare. These Terms and Conditions (&quot;Terms&quot;) govern your use of our website and services. By accessing or using Excel Compare, you agree to be bound by these Terms. If you do not agree, please do not use our services.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Our Services (Provided &quot;As Is&quot;)</h2>
        <p className="text-gray-700 mb-4">
          Excel Compare provides a free online tool for comparing Excel files.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">No Warranty:</h3>
            <p className="text-gray-700">We provide the service on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee that the service will be error-free, uninterrupted, or 100% secure.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Your Risk:</h3>
            <p className="text-gray-700">You use this service entirely at your own risk. We are not responsible for any inaccuracies in the comparison results. You should always verify important data manually.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Intellectual Property</h2>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Ownership:</h3>
            <p className="text-gray-700">Excel Compare and its underlying software, design, and content are owned by us and protected by intellectual property laws.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Limited License:</h3>
            <p className="text-gray-700">We grant you a limited, non-exclusive, non-transferable license to access and use the website for its intended purpose (comparing files). You may not copy, reverse engineer, or resell our software or services.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Your Data and Content</h2>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">License to Process:</h3>
            <p className="text-gray-700">By uploading files (Excel sheets, data) to our service, you grant us a worldwide, royalty-free license to use, process, and reproduce this data solely for the purpose of providing the comparison service to you.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Anonymized Analytics:</h3>
            <p className="text-gray-700">You acknowledge that we may use aggregated, anonymized data (which does not identify you or your specific content) to analyze usage patterns and improve our system.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Responsibility:</h3>
            <p className="text-gray-700">You retain ownership of your data. You are solely responsible for ensuring you have the legal right to upload and compare the files you submit.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. User Conduct</h2>
        <p className="text-gray-700 mb-6">
          You agree NOT to:
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Upload any files containing viruses, malware, or harmful code.</h3>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Upload content that is illegal, offensive, or infringes on the rights of others.</h3>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Attempt to disrupt, hack, or overwhelm our servers (e.g., DDoS attacks).</h3>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Limitation of Liability</h2>
        <p className="text-gray-700 mb-6">
          To the fullest extent permitted by law, Excel Compare shall not be liable for any direct, indirect, incidental, or consequential damages resulting from:
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Your use or inability to use the service.</h3>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Any errors or inaccuracies in the comparison results.</h3>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Loss of data, profits, or business reputation.</h3>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Unauthorized access to or alteration of your transmissions or data.</h3>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Third-Party Links</h2>
        <p className="text-gray-700 mb-6">
          Our website may contain links to third-party websites. We have no control over these sites and are not responsible for their content or privacy practices. Accessing them is at your own risk.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Modifications</h2>
        <p className="text-gray-700 mb-6">
          We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of Excel Compare after changes implies your acceptance of the new Terms.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Governing Law</h2>
        <p className="text-gray-700 mb-6">
          These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Excel Compare operates, without regard to its conflict of law provisions.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
        <p className="text-gray-700 mb-6">
          If you have any questions about these Terms, please contact us at: <a href="mailto:support@excelcompare.org" className="text-blue-600 hover:text-blue-800 underline">support@excelcompare.org</a>
        </p>
      </div>
        </div>
      </main>
      <FooterWrapper locale="en" />
    </div>
  )
}