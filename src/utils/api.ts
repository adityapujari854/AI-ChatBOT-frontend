import axios from 'axios';

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Send a message to the backend or local API route.
 */
export const sendMessageToBackend = async (
  message: string,
  sessionId: string,
  userId: string,
  language: string = 'en'
): Promise<string> => {
  try {
    const payload = {
      prompt: message,
      language,
      session_id: sessionId,
      user_id: userId,
    };

    const url = backendURL
      ? `${backendURL}/api/v1/chat`
      : '/api/v1/chat/stream';

    const response = await axios.post(url, payload);

    return response.data.response || 'No response from backend.';
  } catch (error) {
    console.error('Error sending message to backend:', error);
    return 'Sorry, something went wrong. Please try again later.';
  }
};

/**
 * Fetch chat history for a specific session.
 */
export const fetchChatHistory = async (
  sessionId: string
): Promise<{ user: string; ai: string }[]> => {
  try {
    const response = await axios.get(`${backendURL}/api/v1/chat/history`, {
      params: { session_id: sessionId },
    });

    return response.data.history || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

/**
 * Fetch list of all sessions for a specific user.
 */
export const fetchSessions = async (userId: string): Promise<{
  id: string;
  title: string;
  created_at: string;
}[]> => {
  try {
    const response = await axios.get(`${backendURL}/api/v1/chat/sessions`, {
      params: { user_id: userId },
    });

    // Backend returns a list directly, not { sessions: [...] }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};


