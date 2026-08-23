import { useState } from "react";
import { MobileNavFloating } from "../components/MobileNavFloating";
import { MobileNavPill } from "../components/MobileNavPill";

export function NavDemoPage() {
  const [style, setStyle] = useState<"default" | "floating" | "pill">("default");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mobile Navigation Styles Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Choose your preferred mobile bottom navigation style
        </p>

        {/* Style Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Navigation Style
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setStyle("default")}
              className={`p-6 rounded-xl border-2 transition-all ${
                style === "default"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-400"
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="font-semibold text-gray-900 dark:text-white">Default</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  iOS/Android Style
                </p>
              </div>
            </button>

            <button
              onClick={() => setStyle("floating")}
              className={`p-6 rounded-xl border-2 transition-all ${
                style === "floating"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-400"
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🎈</div>
                <p className="font-semibold text-gray-900 dark:text-white">Floating</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Floating Buttons
                </p>
              </div>
            </button>

            <button
              onClick={() => setStyle("pill")}
              className={`p-6 rounded-xl border-2 transition-all ${
                style === "pill"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-400"
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">💊</div>
                <p className="font-semibold text-gray-900 dark:text-white">Pill</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Sliding Indicator
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Current Style: {style.charAt(0).toUpperCase() + style.slice(1)}
          </h2>
          
          {style === "default" && (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Glassmorphism Effect</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Backdrop blur with transparency</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Gradient Backgrounds</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active items have green gradient icons</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Pulsing Indicator</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Animated dot on active item</p>
                </div>
              </div>
            </div>
          )}

          {style === "floating" && (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Floating Animation</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active button floats above the bar</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Colorful Gradients</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Each nav item has unique color</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Glow Effects</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Blur and pulse on active state</p>
                </div>
              </div>
            </div>
          )}

          {style === "pill" && (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Sliding Background</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Smooth sliding green background</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Compact Design</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Centered pill, minimal footprint</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Clean Aesthetic</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Instagram-style navigation</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Preview
          </h2>
          <div className="bg-gray-100 dark:bg-gray-900 rounded-xl h-96 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Switch to mobile view to see the navigation in action
              </p>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            💡 How to Apply
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p><strong>Default Style:</strong> Already active in Navigation.tsx (current implementation)</p>
            <p><strong>Floating Style:</strong> Import and use MobileNavFloating component</p>
            <p><strong>Pill Style:</strong> Import and use MobileNavPill component</p>
            <p className="mt-3 pt-3 border-t border-blue-300 dark:border-blue-700">
              See <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">/MOBILE_NAV_VARIANTS.md</code> for detailed instructions
            </p>
          </div>
        </div>
      </div>

      {/* Render selected style */}
      {style === "floating" && <MobileNavFloating />}
      {style === "pill" && <MobileNavPill />}
      {/* Default is already in Navigation component */}
    </div>
  );
}
