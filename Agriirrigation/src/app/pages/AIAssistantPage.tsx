import { Bot, Send, Upload, Camera, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const suggestedQuestions = [
  "What's the best time to irrigate today?",
  "How do I improve soil fertility?",
  "When should I harvest my wheat crop?",
  "What fertilizer do you recommend?",
];



export function AIAssistantPage() {
  const [message, setMessage] = useState("");
  const [diseaseImage, setDiseaseImage] = useState<string | null>(null);
  const [diseaseResult, setDiseaseResult] = useState<any>(null);

  const [chatHistory, setChatHistory] = useState([
  {
    type: "bot",
    message: "Hello! I'm your AI farming assistant. How can I help you today?",
    time: new Date().toLocaleTimeString(),
  },
]);

  const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!message.trim()) return;

  const userInput = message;

  const userMsg = {
    type: "user",
    message: userInput,
    time: new Date().toLocaleTimeString(),
  };

  setChatHistory((prev) => [...prev, userMsg]);
  setMessage("");

  try {
    const res = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userInput }),
    });

    const data = await res.json();

    const botMsg = {
      type: "bot",
      message: data.reply,
      time: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, botMsg]);
  } catch (error) {
    setChatHistory((prev) => [
      ...prev,
      {
        type: "bot",
        message: "Server error bro 😅",
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }
};

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // preview image
  const reader = new FileReader();
  reader.onload = () => {
    setDiseaseImage(reader.result as string);
  };
  reader.readAsDataURL(file);

  // send to backend
  const formData = new FormData();
  formData.append("image", file);

  try {
    setDiseaseResult(null);
    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setDiseaseResult({
      disease: data.disease,
      confidence: Number(data.confidence).toFixed(2),
      cause: "Virus detected in plant",
      treatment:
        "1. Remove infected leaves\n2. Use proper pesticide\n3. Maintain hygiene\n4. Monitor irrigation",
    });
  } catch (error) {
    console.error("Error:", error);
    setDiseaseResult({
  disease: "Error",
  confidence: "0",
  cause: "Backend connection failed",
  treatment: "Check server or network",
  });
  }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Get expert farming advice and plant disease detection
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chatbot Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm flex flex-col h-[700px]">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Farming Chatbot
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-500">● Online</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`flex ${chat.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      chat.type === "user"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    } rounded-2xl px-4 py-3`}
                  >
                    <p className="text-sm">{chat.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        chat.type === "user" ? "text-green-100" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {chat.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Questions */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(question)}
                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything about farming..."
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Plant Disease Detection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Plant Disease Detection
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload a photo of your plant
                </p>
              </div>
            </div>

            {/* Upload Area */}
            <div className="mb-6">
  {/* Upload Input */}
  <input
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
    className="hidden"
    id="fileInput"
  />

  {/* Camera Input */}
  <input
    type="file"
    accept="image/*"
    capture="environment"
    onChange={handleImageUpload}
    className="hidden"
    id="cameraInput"
  />

  {/* CLICKABLE BOX */}
  <div
    onClick={() => document.getElementById("fileInput")?.click()}
    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
  >
    {diseaseImage ? (
      <div className="space-y-4">
        <img
          src={diseaseImage}
          alt="Uploaded plant"
          className="w-full h-64 object-cover rounded-lg"
        />
        <button
          onClick={(e) => {
            e.stopPropagation(); // 🔥 VERY IMPORTANT
            setDiseaseImage(null);
            setDiseaseResult(null);
          }}
          className="text-sm text-green-600 hover:underline"
        >
          Upload different image
        </button>
      </div>
    ) : (
      <>
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG up to 10MB
        </p>
      </>
    )}
  </div>
</div>

            {/* Camera Option */}
            <button onClick={() => document.getElementById("cameraInput")?.click()} className="w-full mb-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300 hover:border-green-500 transition-colors">
              <Camera className="w-5 h-5" />
              <span>Take Photo with Camera</span>
            </button>

            {/* Detection Result */}
            {diseaseResult && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-red-900 dark:text-red-400">
                    Detection Result
                  </h4>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-sm">
                    {diseaseResult.confidence}% confidence
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Disease Name
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {diseaseResult.disease}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Cause
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{diseaseResult.cause}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Treatment Suggestions
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                        {diseaseResult.treatment}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!diseaseResult && diseaseImage && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Analyzing image...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
