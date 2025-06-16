import React, { useState, useEffect, useCallback } from "react";
import { Menu, X, Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import ChatInput from "./ChatInput";
import "../styles/chatLayout.css";

export type SessionType = {
  id: string;
  title: string;
  createdAt: string;
  messages: { user: string; ai: string }[];
};

interface ChatLayoutProps {
  children: React.ReactNode;
  sessions: SessionType[];
  chatHistory: { user: string; ai: string }[];
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onSubmitMessage: (message: string) => Promise<void>;
  onStopGeneration: () => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  children,
  sessions,
  chatHistory,
  onSelectSession,
  onNewSession,
  onSubmitMessage,
  onStopGeneration,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and set initial sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1025; // Mobile: Below 1025px
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Closed by default on mobile
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Set initial session on load
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const mostRecentSession = sessions[0];
      setSelectedSessionId(mostRecentSession.id);
      onSelectSession(mostRecentSession.id);
    }
  }, [sessions, selectedSessionId, onSelectSession]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sidebarOpen && isMobile && !target.closest('.sidebar-container') && !target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, isMobile]);

  const handleSessionSelect = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
    onSelectSession(sessionId);
    if (isMobile) setSidebarOpen(false);
  }, [onSelectSession, isMobile]);

  const handleNewSession = useCallback(() => {
    onNewSession();
    setSelectedSessionId(null);
    if (isMobile) setSidebarOpen(false);
  }, [onNewSession, isMobile]);

  const handleSubmit = useCallback(async (message: string) => {
    if (generating) return;

    try {
      setGenerating(true);
      await onSubmitMessage(message);
    } catch (error) {
      console.error("Message submission error:", error);
    } finally {
      setGenerating(false);
    }
  }, [generating, onSubmitMessage]);

  const handleStop = useCallback(() => {
    setGenerating(false);
    onStopGeneration();
  }, [onStopGeneration]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="chat-layout dark:bg-gray-900 relative">
      {/* Sidebar Toggle Button */}
      <button
        className={`sidebar-toggle ${sidebarOpen && !isMobile ? 'left-[280px]' : 'left-4'}`}
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'} ${isMobile ? 'mobile' : ''}`}
      >
        <div className="flex flex-col h-full">
          <div className="sidebar-header">
            <div className="app-title">NIMBUS</div>
            <button
              onClick={handleNewSession}
              className="new-chat-btn"
            >
              <Plus size={18} className="mr-2" />
              New Chat
            </button>
          </div>
          <div className="conversations-section">
            <div className="section-title">CONVERSATIONS</div>
            <Sidebar
              sessions={sessions}
              chatHistory={chatHistory}
              selectedSessionId={selectedSessionId}
              onSelectSession={handleSessionSelect}
              onNewSession={handleNewSession}
            />
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div className="mobile-overlay visible" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content area */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${isMobile && sidebarOpen ? 'sidebar-pushed' : ''}`}>
        <div className="chat-area">
          {React.Children.count(children) === 0 ? (
            <div className="empty-state">
              <h2>Nimbus</h2>
              <p>How can I help you today?</p>
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto">
              {children}
            </div>
          )}
        </div>

        {/* Chat Input - Now fixed at bottom */}
        <div className="chat-input-container">
          <div className="chat-input-box">
            <ChatInput
              onSubmit={handleSubmit}
              onStop={handleStop}
              generating={generating}
              setGenerating={setGenerating}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatLayout;
