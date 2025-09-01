"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PromptStyle = "freaky" | "victorian" | "caveman";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<PromptStyle>("freaky");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoinChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      setIsLoading(true);
      // Store nickname and style in localStorage and navigate to chat
      localStorage.setItem("hallucitalk-nickname", nickname.trim());
      localStorage.setItem("hallucitalk-style", selectedStyle);
      router.push("/chat");
    }
  };

  const styleOptions = [
    {
      value: "freaky" as PromptStyle,
      label: "Ultra-Freaky 👅",
      description: "Chaotic, playful, and absolutely wild transformations",
      color: "from-pink-500 to-violet-500",
    },
    {
      value: "victorian" as PromptStyle,
      label: "Victorian Elegance 🎩",
      description: "Pompous, ornate, and excessively formal style",
      color: "from-amber-500 to-orange-500",
    },
    {
      value: "caveman" as PromptStyle,
      label: "Caveman Simple 🔥",
      description: "Extremely simple, basic, and primal language",
      color: "from-stone-500 to-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            HalluciTalk
          </h1>
          <p className="text-white/80 text-lg">
            Enter the AI-powered chat realm where your words transform into
            magic with your chosen style ✨
          </p>
        </div>

        <form onSubmit={handleJoinChat} className="space-y-6">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-white/90 mb-2"
            >
              Choose your nickname
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname..."
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Choose your transformation style
            </label>
            <div className="space-y-3">
              {styleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`block cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                    selectedStyle === option.value
                      ? "border-white/50 bg-white/20"
                      : "border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/15"
                  }`}
                >
                  <div className="p-4">
                    <input
                      type="radio"
                      name="style"
                      value={option.value}
                      checked={selectedStyle === option.value}
                      onChange={(e) =>
                        setSelectedStyle(e.target.value as PromptStyle)
                      }
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className={`text-lg font-bold bg-gradient-to-r ${option.color} bg-clip-text text-transparent`}
                        >
                          {option.label}
                        </div>
                        <div className="text-white/70 text-sm mt-1">
                          {option.description}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                          selectedStyle === option.value
                            ? "border-white bg-white"
                            : "border-white/40"
                        }`}
                      >
                        {selectedStyle === option.value && (
                          <div className="w-full h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-600"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!nickname.trim() || isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Joining...
              </div>
            ) : (
              "Enter the Chat Realm"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Your nickname and messages will be magically transformed by AI in
            your chosen style
          </p>
        </div>
      </div>
    </div>
  );
}
