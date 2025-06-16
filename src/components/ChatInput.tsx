"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SendHorizonal, PauseCircle, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => Promise<void>;
  onStop: () => void;
  generating: boolean;
  setGenerating: (value: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  onStop,
  generating,
  setGenerating,
}) => {
  const [input, setInput] = useState<string>("");
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Focus input when not generating
  useEffect(() => {
    if (!generating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [generating]);

  const handleSubmit = useCallback(async () => {
    const message = input.trim();
    if (!message || generating) return;

    try {
      setGenerating(true);
      await onSubmit(message);
      setInput("");
    } catch (error) {
      console.error("Submission error:", error);
    }
  }, [input, generating, onSubmit, setGenerating]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStop = useCallback(() => {
    onStop();
  }, [onStop]);

  return (
    <div className="chat-input-container">
      <div className="chat-input-box">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-end gap-2 w-full"
        >
          <div className="flex items-center gap-2 w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-1 pl-3">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Attach file"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea
              ref={inputRef}
              className="flex-1 resize-none py-3 text-sm dark:bg-gray-800 dark:text-white focus:outline-none max-h-[200px]"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="Message Nimbus..."
              disabled={generating}
              aria-label="Chat input"
            />

            <div className="flex-shrink-0 pb-1 pr-1">
              {generating ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label="Stop generating"
                  title="Stop generating"
                >
                  <PauseCircle className="w-6 h-6" />
                </button>
              ) : (
                <button
                  type="submit"
                  className={`p-2 rounded-full transition-colors ${
                    input.trim()
                      ? "text-primary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  aria-label="Send message"
                  title="Send message"
                  disabled={!input.trim()}
                >
                  <SendHorizonal className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Nimbus can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;