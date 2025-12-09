import { Mail, Users, Receipt } from "lucide-react";

interface RealWorldScenariosTwoColumnsProps {
  dictionary: any
}

function RealWorldScenariosTwoColumnsI18n({ dictionary }: RealWorldScenariosTwoColumnsProps) {
  const scenarios = [
    {
      title: dictionary.compareTwoColumns?.scenarios?.emailMarketing?.title || "Email Marketing Cleanup",
      icon: <Mail className="h-6 w-6" style={{ color: '#20A884' }} />,
      useCaseContent: dictionary.compareTwoColumns?.scenarios?.emailMarketing?.content || "You have a \"New Leads\" list and a \"Do Not Contact\" list. Use this tool to compare the email columns and instantly generate a clean list by removing anyone who appears in the exclusion list."
    },
    {
      title: dictionary.compareTwoColumns?.scenarios?.eventTracking?.title || "Event Attendance Tracking",
      icon: <Users className="h-6 w-6" style={{ color: '#20A884' }} />,
      useCaseContent: dictionary.compareTwoColumns?.scenarios?.eventTracking?.content || "Compare your \"Registered Attendees\" column against the \"Checked-In\" column. Select \"Unique to Registered\" to instantly get a list of people who signed up but missed the event."
    },
    {
      title: dictionary.compareTwoColumns?.scenarios?.financialReconciliation?.title || "Monthly Financial Reconciliation",
      icon: <Receipt className="h-6 w-6" style={{ color: '#20A884' }} />,
      useCaseContent: dictionary.compareTwoColumns?.scenarios?.financialReconciliation?.content || "Upload your internal ledger and your bank statement. Compare the \"Transaction Reference ID\" columns to spot which entries are recorded in the bank but missing from your books (or vice versa)."
    }
  ];

  return (
    <div className="w-full py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">
            {dictionary.compareTwoColumns?.scenarios?.title || "Real-World Scenarios for Column Comparison"}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {dictionary.compareTwoColumns?.scenarios?.subtitle || "Simplify data reconciliation tasks for marketing, HR, and finance."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {scenarios.map((scenario, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  {scenario.icon}
                </div>
                <h3 className="text-xl font-semibold ml-3">
                  {scenario.title}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-md">
                  <p className="text-gray-600 leading-relaxed">
                    {scenario.useCaseContent}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { RealWorldScenariosTwoColumnsI18n };