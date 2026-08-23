import { Mail, MessageCircle, Phone, Clock, MapPin, Send, CheckCircle, HelpCircle, Book, Video } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            How Can We Help?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Our support team is here to assist you 24/7
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
            <p className="text-sm opacity-90 mb-4">
              Get instant help from our support team
            </p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Start Chat
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
            <p className="text-sm opacity-90 mb-4">
              Call us for urgent technical issues
            </p>
            <a href="tel:+1-800-AGRI-HELP" className="block bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">
              +1-800-AGRI-HELP
            </a>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Support</h3>
            <p className="text-sm opacity-90 mb-4">
              Response within 24 hours
            </p>
            <a href="mailto:support@agri-irrigation.com" className="block bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">
              Send Email
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Submit a Support Ticket
              </h2>

              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ticket Submitted Successfully!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We've received your request and will respond within 24 hours.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Ticket ID: <span className="font-mono font-bold">#AG-{Math.floor(Math.random() * 100000)}</span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="John Farmer"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="farmer@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Account</option>
                      <option value="device">Device Setup</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
                      placeholder="Please provide details about your issue..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Submit Ticket</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>Support Hours</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-medium">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday - Sunday:</span>
                  <span className="font-medium">24/7</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ Emergency support available 24/7
                  </p>
                </div>
              </div>
            </div>

            {/* Office Location */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>Office Location</span>
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>Agri-Irrigation Inc.</p>
                <p>123 Farm Tech Boulevard</p>
                <p>Silicon Valley, CA 94025</p>
                <p>United States</p>
              </div>
            </div>

            {/* Quick Resources */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>Quick Resources</span>
              </h3>
              <div className="space-y-3">
                <Link
                  to="/documentation"
                  className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <Book className="w-4 h-4" />
                  <span>Documentation</span>
                </Link>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span>Video Tutorials</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Community Forum</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                How do I connect my first sensor?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Go to Devices page, click "Add Device", and scan the QR code on your sensor.
                Follow the on-screen instructions to complete setup.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                What if my irrigation system won't start?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check valve power supply, verify device connectivity, and ensure your irrigation
                schedule is properly configured. Contact support if the issue persists.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                How accurate are the soil moisture readings?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our sensors provide ±2% accuracy. For best results, calibrate sensors monthly
                and place them in the crop root zone (6-12 inches deep).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I control irrigation from my mobile phone?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes! Our platform is fully responsive. Simply access the dashboard from your
                mobile browser to control irrigation anywhere, anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
