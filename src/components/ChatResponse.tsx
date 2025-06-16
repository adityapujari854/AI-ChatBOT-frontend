"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import DOMPurify from "dompurify";
import { useRouter } from "next/navigation";

interface ChatMessage {
  user: string;
  ai: string;
  id: string;
  timestamp?: number;
}

const ChatResponse = () => {
  const [error, setError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Initialize user and session IDs
  useEffect(() => {
    const initializeIds = () => {
      const storedUserId = localStorage.getItem("user_id") || uuidv4();
      localStorage.setItem("user_id", storedUserId);
      setUserId(storedUserId);

      const storedSessionId = localStorage.getItem("session_id") || `session-${Date.now()}`;
      localStorage.setItem("session_id", storedSessionId);
      setSessionId(storedSessionId);
    };

    initializeIds();
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Handle streaming the AI response
  const handleStreamMessage = useCallback(async (message: string) => {
    if (!message.trim() || isGenerating) return;

    setIsGenerating(true);
    setError("");
    
    // Add new message to history with unique ID
    const newMessageId = uuidv4();
    setChatHistory(prev => [
      ...prev,
      { 
        user: message, 
        ai: "", 
        id: newMessageId,
        timestamp: Date.now()
      }
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: message,
          session_id: sessionId,
          user_id: userId,
          language: "en",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        // Update the last message with streaming response
        setChatHistory(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.id === newMessageId) {
            lastMessage.ai = DOMPurify.sanitize(aiResponse);
          }
          return updated;
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Stream aborted by user");
      } else {
        console.error("Streaming error:", err);
        setError("Failed to get response. Please try again.");
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [isGenerating, sessionId, userId]);

  // Handle stopping generation
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log("Generation stopped");
    }
    setIsGenerating(false);
  }, []);

  // Create new chat session
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    localStorage.setItem("session_id", newSessionId);
    setChatHistory([]);
    setError("");
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-auto p-4 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Chat Assistant
            </h1>
            <button
              onClick={handleNewChat}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              New Chat
            </button>
          </div>

          <div className="space-y-4">
            {chatHistory.map((message, idx) => (
              <div key={message.id} className="space-y-2">
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow max-w-[85%]">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {message.user}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow max-w-[85%] prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: message.ai || (idx === chatHistory.length - 1 && isGenerating ? 
                        '<span class="animate-pulse">Thinking...</span>' : '') 
                    }}
                  />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto p-4">
          <ChatInput
            onSubmit={handleStreamMessage}
            onStop={handleStop}
            generating={isGenerating}
            setGenerating={setIsGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatResponse;