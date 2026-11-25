import { Bot, Book, Github } from "lucide-react";
import { Link } from "react-router";
import { REPO_URL } from "../lib/links";

const faqs = [
  {
    q: "How do I connect my sensor controller?",
    a: "Flash the ESP32 so it writes readings to devices/ESP32_001/data in your Firebase Realtime Database. The Documentation page lists the fields the app reads.",
  },
  {
    q: "What if irrigation won't start?",
    a: "Check the pump or relay power and wiring, and that the ESP32 is online. The Irrigation page writes ON/OFF to devices/ESP32_001/commands, which the ESP32 must read.",
  },
  {
    q: "How accurate are the soil moisture readings?",
    a: "It depends on the sensor and your soil. Calibrate the sensor in dry and in wet soil from your own field, and place it in the root zone (about 15–30 cm deep).",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes. The web app works in a mobile browser; there is no separate mobile app.",
  },
];

export function SupportPage() {
  const options = [
    {
      icon: Bot,
      title: "Ask the farming chatbot",
      text: "For crop, soil and irrigation questions.",
      action: <Link to="/ai-assistant" className="block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">Open AI Assistant</Link>,
      bg: "from-blue-500 to-blue-600",
    },
    {
      icon: Book,
      title: "Read the documentation",
      text: "Setup, how recommendations work and the API.",
      action: <Link to="/docs" className="block bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">Open Documentation</Link>,
      bg: "from-green-500 to-green-600",
    },
    {
      icon: Github,
      title: "Report a problem",
      text: "Found a bug or have an idea? Open an issue on GitHub.",
      action: <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer" className="block bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">Open GitHub Issues</a>,
      bg: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            How Can We Help?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Agri-Irrigation is an open-source project. Here is where to get help.
          </p>
        </div>

        {/* Help options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {options.map(({ icon: Icon, title, text, action, bg }) => (
            <div key={title} className={`bg-gradient-to-br ${bg} rounded-xl p-6 text-white`}>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm opacity-90 mb-4">{text}</p>
              {action}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map(({ q, a }) => (
              <div key={q}>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{q}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
