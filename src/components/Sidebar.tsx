"use client";

import React from "react";
import { Plus } from "lucide-react";
import "../styles/chatLayout.css";

export interface SessionType {
  id: string;
  title: string;
  createdAt: string;
  messages: { user: string; ai: string }[];
}

interface SidebarProps {
  sessions: SessionType[];
  chatHistory: { user: string; ai: string }[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
}

const Sidebar = ({
  sessions,
  chatHistory,
  selectedSessionId,
  onSelectSession,
  onNewSession,
}: SidebarProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-6 p-4">
        {/* Recent Chats Section */}
        {chatHistory.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Recent Chats
            </h2>
            <ul className="space-y-1">
              {chatHistory.slice(0, 5).map((chat, index) => (
                <li key={`recent-${index}`}>
                  <button
                    onClick={() => onSelectSession(`recent-${index}`)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedSessionId === `recent-${index}`
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {chat.user.substring(0, 50) || `Chat ${index + 1}`}
                    {chat.user.length > 50 && " ..."}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Saved Sessions Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Conversations
            </h2>
            <button
              onClick={onNewSession}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              aria-label="New chat"
              title="Start new conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <li key={session.id}>
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors truncate ${
                      selectedSessionId === session.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                    title={session.title || `Session from ${new Date(session.createdAt).toLocaleDateString()}`}
                  >
                    {session.title || `Session ${new Date(session.createdAt).toLocaleDateString()}`}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No conversations yet
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
