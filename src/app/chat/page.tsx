"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface User {
  id: string;
  nickname: string;
  originalNickname: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const nickname = localStorage.getItem("hallucitalk-nickname");

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
      newSocket.emit("join", nickname);
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
    localStorage.removeItem("hallucitalk-nickname");
    router.push("/");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">HalluciTalk</h1>
            {currentUser && (
              <p className="text-white/80 text-sm">
                Welcome,{" "}
                <span className="font-medium">{currentUser.nickname}</span>
                {currentUser.nickname !== currentUser.originalNickname && (
                  <span className="text-white/60">
                    {" "}
                    (originally {currentUser.originalNickname})
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white/80 text-sm">
              {users.length} {users.length === 1 ? "user" : "users"} online
            </div>
            <button
              onClick={leaveChat}
              className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Leave Chat
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Users Sidebar */}
        <div className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 p-4">
          <h3 className="text-white font-semibold mb-4">Online Users</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-2 rounded-lg relative group ${
                  user.id === currentUser?.id ? "bg-white/20" : "bg-white/10"
                }`}
                title={
                  user.nickname !== user.originalNickname
                    ? `Original: ${user.originalNickname}`
                    : undefined
                }
              >
                <div className="flex items-center space-between">
                  <div className="text-white font-medium">{user.nickname}</div>
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
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex justify-start">
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative group ${
                    message.user.originalNickname === userOriginalNickname
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-2 border-indigo-400"
                      : "bg-white/20 text-white backdrop-blur-sm border-2 border-transparent"
                  }`}
                  title={
                    message.content !== message.originalContent
                      ? `Original: ${message.originalContent}`
                      : undefined
                  }
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">
                      {message.user.nickname}
                      {message.user.originalNickname ===
                        userOriginalNickname && (
                        <span className="ml-1 text-xs opacity-75">(You)</span>
                      )}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.content !== message.originalContent && (
                      <span
                        className="text-xs opacity-50 ml-1"
                        title="Message was transformed by AI"
                      >
                        ✨
                      </span>
                    )}
                  </div>
                  <div className="break-words cursor-default">
                    {message.content}
                  </div>

                  {/* Custom Tooltip */}
                  {message.content !== message.originalContent && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
                      <div className="font-medium text-xs text-gray-300 mb-1">
                        Original message:
                      </div>
                      <div className="break-words">
                        {message.originalContent}
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-white/20 p-4">
            <form onSubmit={sendMessage} className="flex space-x-4">
              <input
                type="text"
                value={messageInput}
                onChange={(e) =>
                  setMessageInput((e.target as HTMLInputElement).value)
                }
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
