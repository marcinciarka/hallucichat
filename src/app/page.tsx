"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromptStyle } from "../types";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<PromptStyle>("uwu");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoinChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      setIsLoading(true);
      // Store nickname and style in localStorage and navigate to chat
      localStorage.setItem("HalluciChat-nickname", nickname.trim());
      localStorage.setItem("HalluciChat-style", selectedStyle);
      router.push("/chat");
    }
  };

  const styleOptions = [
    {
      value: "uwu" as PromptStyle,
      label: "Ultra-Cute UwU",
      color: "from-pink-400 to-violet-400",
    },
    {
      value: "victorian" as PromptStyle,
      label: "Victorian",
      color: "from-amber-400 to-orange-800",
    },
    {
      value: "caveman" as PromptStyle,
      label: "Caveman",
      color: "from-red-400 to-amber-800",
    },
    {
      value: "boomer" as PromptStyle,
      label: "Boomer",
      color: "from-green-400 to-blue-800",
    },
    {
      value: "pirate" as PromptStyle,
      label: "Pirate",
      color: "from-indigo-400 to-purple-800",
    },
    {
      value: "robot" as PromptStyle,
      label: "Robot",
      color: "from-gray-200 to-zinc-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-white/20">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            HalluciChat
          </h1>
          <p className="text-white/80 text-base sm:text-lg">
            Enter the AI-powered chat realm where your words transform into
            magic with your chosen style ✨
          </p>
        </div>

        <form onSubmit={handleJoinChat} className="space-y-4 sm:space-y-6">
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
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm text-base"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Choose your transformation style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {styleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`block cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                    selectedStyle === option.value
                      ? "border-slate-400 bg-slate-800"
                      : "border-slate-800 bg-slate-800 hover:border-slate-500 hover:bg-slate-700 active:bg-slate-800"
                  }`}
                >
                  <div className="p-3 sm:p-4">
                    <input
                      type="radio"
                      name="style"
                      value={option.value}
                      hidden
                      checked={selectedStyle === option.value}
                      onChange={(e) =>
                        setSelectedStyle(e.target.value as PromptStyle)
                      }
                      className="sr-only hidden"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-base text-center sm:text-lg font-bold bg-gradient-to-r ${option.color} bg-clip-text text-transparent`}
                        >
                          {option.label}
                        </div>
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
            className="w-full cursor-pointer bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base sm:text-lg"
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
