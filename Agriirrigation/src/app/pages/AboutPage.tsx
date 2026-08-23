import { Droplet, Target, Users, Zap, Shield, Globe, Award, TrendingUp } from "lucide-react";
import { Link } from "react-router";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-3 mb-4">
            <Droplet className="w-12 h-12 text-green-600 dark:text-green-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Agri-Irrigation
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Empowering farmers with smart irrigation technology to optimize water usage,
            increase crop yields, and build sustainable agricultural practices.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 md:p-12 mb-12 text-white">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg opacity-90 leading-relaxed">
                To revolutionize agriculture through intelligent irrigation systems that conserve water,
                maximize productivity, and ensure food security for future generations. We believe every
                farmer deserves access to cutting-edge technology that makes farming easier, more
                profitable, and environmentally sustainable.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sustainability
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Protecting our planet's resources while ensuring agricultural productivity
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Innovation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leveraging AI and IoT to bring the latest technology to every farm
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Community
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Supporting farmers worldwide with knowledge sharing and collaboration
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Growth
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Helping farmers increase yields and profitability through data-driven insights
              </p>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Founded in 2020, Agri-Irrigation began with a simple observation: farmers were
                wasting billions of gallons of water annually due to inefficient irrigation practices.
              </p>
              <p>
                Our team of agricultural engineers, data scientists, and IoT specialists came together
                to create a comprehensive solution that combines real-time soil monitoring, weather
                prediction, and AI-powered decision making.
              </p>
              <p>
                Today, we serve over 10,000 farms across 25 countries, saving an average of 40%
                water usage while increasing crop yields by 25%.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Impact by Numbers
            </h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">10,000+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Farms</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Droplet className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">40%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Water Saved</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">25%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Yield Increase</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Powered by Advanced Technology
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">IoT Sensors</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time monitoring of soil moisture, temperature, humidity, and water flow
                across your entire farm.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Machine learning algorithms that predict optimal irrigation schedules based on
                crop type, weather, and soil conditions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cloud Platform</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access your farm data anytime, anywhere with our secure cloud-based dashboard
                and mobile apps.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join the Smart Farming Revolution</h2>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Start optimizing your irrigation today and see the difference data-driven farming can make.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
