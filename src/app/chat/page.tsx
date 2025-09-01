"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { PromptStyle } from "../../types";

interface User {
  id: string;
  nickname: string;
  originalNickname: string;
  style: PromptStyle;
}

interface Message {
  id: string;
  user: User;
  content: string;
  originalContent: string;
  timestamp: Date;
}

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOriginalNickname, setUserOriginalNickname] = useState<
    string | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showingOriginal, setShowingOriginal] = useState<Set<string>>(
    new Set()
  );
  const [quotaInfo, setQuotaInfo] = useState<{
    requestsRemaining: number | null;
    requestsLimit: number | null;
    resetTime: Date | null;
    isExceeded: boolean;
    lastError: string | null;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const nickname = localStorage.getItem("HalluciChat-nickname");
    const style =
      (localStorage.getItem("HalluciChat-style") as PromptStyle) || "freaky";

    if (!nickname) {
      router.push("/");
      return;
    }

    // Store the original nickname for comparison
    setUserOriginalNickname(nickname);

    // Initialize socket connection
    const newSocket = io(
      process.env.NODE_ENV === "production"
        ? window.location.origin
        : "http://localhost:3001"
    );

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnecting(false);
      newSocket.emit("join", { nickname, style });
    });

    newSocket.on("user-joined", (user: User) => {
      if (user.id === newSocket.id) {
        setCurrentUser(user);
      }
    });

    newSocket.on("users-list", (usersList: User[]) => {
      setUsers(usersList);
    });

    newSocket.on("messages-history", (messagesHistory: Message[]) => {
      setMessages(
        messagesHistory.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
    });

    newSocket.on("new-message", (message: Message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          timestamp: new Date(message.timestamp),
        },
      ]);
    });

    newSocket.on("user-left", (user: User) => {
      console.log(`${user.nickname} left the chat`);
    });

    newSocket.on(
      "quota-update",
      (quota: {
        requestsRemaining: number | null;
        requestsLimit: number | null;
        resetTime: string | null;
        isExceeded: boolean;
        lastError: string | null;
      }) => {
        setQuotaInfo({
          ...quota,
          resetTime: quota.resetTime ? new Date(quota.resetTime) : null,
        });
      }
    );

    newSocket.on("error", (errorMessage: string) => {
      setError(errorMessage);
    });

    newSocket.on("connect_error", () => {
      setError("Failed to connect to chat server");
      setIsConnecting(false);
    });

    return () => {
      newSocket.close();
    };
  }, [router]);

  // Request quota info periodically
  useEffect(() => {
    if (socket) {
      socket.emit("request-quota");
      const interval = setInterval(() => {
        socket.emit("request-quota");
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && socket) {
      socket.emit("send-message", messageInput.trim());
      setMessageInput("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const leaveChat = () => {
    localStorage.removeItem("HalluciChat-nickname");
    localStorage.removeItem("HalluciChat-style");
    router.push("/");
  };

  const toggleMessageContent = (messageId: string) => {
    setShowingOriginal((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to the chat realm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl mb-4">Connection Error</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-2 px-6 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-3 sm:p-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                HalluciChat
              </h1>
              {currentUser && (
                <div className="text-white/80 text-xs sm:text-sm min-w-0">
                  <p className="flex items-center space-x-1">
                    <span>Welcome,</span>
                    <span className="font-medium text-base truncate max-w-24 sm:max-w-32">
                      {currentUser.nickname}
                    </span>
                    {currentUser.nickname !== currentUser.originalNickname && (
                      <span className="text-white/60 hidden sm:inline truncate">
                        (originally {currentUser.originalNickname})
                      </span>
                    )}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    Style:{" "}
                    <span className="capitalize font-medium">
                      {currentUser.style}
                    </span>{" "}
                    ✨
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {quotaInfo && (
              <div className="text-white/80 text-xs">
                <div
                  className={`font-medium ${
                    quotaInfo.isExceeded ? "text-red-400" : "text-white"
                  }`}
                >
                  {quotaInfo.isExceeded
                    ? "API Limited"
                    : quotaInfo.requestsLimit
                    ? `AI: ${quotaInfo.requestsRemaining || 0}/${
                        quotaInfo.requestsLimit
                      }`
                    : "AI: Unknown"}
                </div>
                {quotaInfo.isExceeded && quotaInfo.lastError && (
                  <div
                    className="text-red-400 text-xs"
                    title={quotaInfo.lastError}
                  >
                    {quotaInfo.resetTime
                      ? `Reset: ${quotaInfo.resetTime.toLocaleTimeString()}`
                      : "Rate limited"}
                  </div>
                )}
              </div>
            )}
            <div className="text-white/80 text-xs sm:text-sm">
              {users.length} {users.length === 1 ? "user" : "users"} online
            </div>
            <button
              onClick={leaveChat}
              className="bg-red-500/80 hover:bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-6xl mx-auto w-full relative overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Users Sidebar */}
        <div
          className={`
          w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 p-4 flex-shrink-0 flex flex-col
          lg:block
          ${isSidebarOpen ? "fixed left-0 top-0 h-full z-50" : "hidden"}
        `}
        >
          <h3 className="text-white font-semibold mb-4 flex-shrink-0">
            Online Users
          </h3>
          <div className="space-y-2 overflow-y-auto flex-1">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-2 rounded-lg relative group ${
                  user.id === currentUser?.id ? "bg-white/20" : "bg-white/10"
                }`}
                title={
                  user.nickname !== user.originalNickname
                    ? `Original: ${user.originalNickname} | Style: ${user.style}`
                    : `Style: ${user.style}`
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-base truncate">
                      {user.nickname}
                    </div>
                    <div className="text-white/60 text-xs capitalize">
                      {user.style} style
                    </div>
                  </div>
                  {user.nickname !== user.originalNickname && (
                    <span
                      className="text-xs opacity-50 ml-1"
                      title="Nickname was transformed by AI"
                    >
                      ✨
                    </span>
                  )}
                </div>

                {/* Custom Tooltip for usernames */}
                {user.nickname !== user.originalNickname && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-medium text-xs text-gray-300 mb-1">
                      Original nickname:
                    </div>
                    <div>{user.originalNickname}</div>
                    <div className="font-medium text-xs text-gray-300 mb-1 mt-2">
                      Transformation style:
                    </div>
                    <div className="capitalize">{user.style}</div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex justify-start">
                <div
                  className={`max-w-xs sm:max-w-sm lg:max-w-lg px-3 py-3 lg:px-4 lg:py-3 rounded-2xl relative group ${
                    message.user.originalNickname === userOriginalNickname
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-2 border-indigo-400"
                      : "bg-white/20 text-white backdrop-blur-sm border-2 border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-center space-x-2 mb-1">
                    <span className="font-medium text-base truncate">
                      {message.user.nickname}
                    </span>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => toggleMessageContent(message.id)}
                        disabled={message.content === message.originalContent}
                        className={`text-xs transition-opacity duration-200 px-2 py-1 rounded-md whitespace-nowrap ${
                          message.content === message.originalContent
                            ? "opacity-0 cursor-not-allowed"
                            : "opacity-0 group-hover:opacity-70 hover:!opacity-100 bg-white/20 hover:bg-white/30"
                        }`}
                        title={
                          message.content === message.originalContent
                            ? "Message not transformed"
                            : showingOriginal.has(message.id)
                            ? "Show AI-transformed message"
                            : "Show original message"
                        }
                      >
                        {showingOriginal.has(message.id)
                          ? "[show ai]"
                          : "[show original]"}
                      </button>
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="break-words cursor-default whitespace-pre-wrap">
                    {showingOriginal.has(message.id)
                      ? message.originalContent
                      : message.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-white/20 p-4 bg-black/20 backdrop-blur-sm lg:bg-transparent flex-shrink-0">
            <form
              onSubmit={sendMessage}
              className="flex space-x-2 lg:space-x-4"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) =>
                  setMessageInput((e.target as HTMLInputElement).value)
                }
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 lg:px-4 lg:py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm text-sm lg:text-base"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold px-4 py-2 lg:px-6 lg:py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm lg:text-base"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
