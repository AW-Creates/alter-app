import React, { createContext, useContext, useState, useEffect } from 'react';
import { LearningJourney, AlterPersona, ChatMessage } from '../types/alter';
import {
  getStoredJourneys,
  saveJourneys,
  getStoredActiveJourneyId,
  setStoredActiveJourneyId
} from '../services/storage';
import { getStoredApiKey, setStoredApiKey } from '../services/gemini';

interface JourneyContextType {
  journeys: LearningJourney[];
  activeJourney: LearningJourney | null;
  activePersona: AlterPersona;
  apiKey: string;
  isApiKeyModalOpen: boolean;
  isCreateModalOpen: boolean;
  setActiveJourneyId: (id: string) => void;
  setActivePersona: (persona: AlterPersona) => void;
  setApiKey: (key: string | null) => void;
  setIsApiKeyModalOpen: (open: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  addJourney: (journey: LearningJourney) => void;
  createJourney: (journey: Omit<LearningJourney, 'id' | 'createdAt' | 'lastActive' | 'streakDays' | 'advisorData' | 'librarianData' | 'tutorData' | 'editorData' | 'roommateData'>) => LearningJourney;
  updateActiveJourney: (updater: (prev: LearningJourney) => LearningJourney) => void;
  deleteJourney: (id: string) => void;
  addChatMessage: (persona: AlterPersona, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [journeys, setJourneys] = useState<LearningJourney[]>([]);
  const [activeJourneyId, setActiveJourneyIdState] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<AlterPersona>('advisor');
  const [apiKey, setApiKeyState] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadedJourneys = getStoredJourneys();
    setJourneys(loadedJourneys);
    const storedId = getStoredActiveJourneyId();
    if (storedId && loadedJourneys.some((j) => j.id === storedId)) {
      setActiveJourneyIdState(storedId);
    } else if (loadedJourneys.length > 0) {
      setActiveJourneyIdState(loadedJourneys[0].id);
      setStoredActiveJourneyId(loadedJourneys[0].id);
    }
    setApiKeyState(getStoredApiKey());
  }, []);

  const activeJourney = journeys.find((j) => j.id === activeJourneyId) || journeys[0] || null;

  const setActiveJourneyId = (id: string) => {
    setActiveJourneyIdState(id);
    setStoredActiveJourneyId(id);
  };

  const setApiKey = (key: string | null) => {
    const finalKey = key || '';
    setApiKeyState(finalKey);
    setStoredApiKey(finalKey);
  };

  const addJourney = (journey: LearningJourney) => {
    const updated = [journey, ...journeys];
    setJourneys(updated);
    setActiveJourneyIdState(journey.id);
    setStoredActiveJourneyId(journey.id);
    saveJourneys(updated);
  };

  const updateActiveJourney = (updater: (prev: LearningJourney) => LearningJourney) => {
    if (!activeJourney) return;
    const updated = updater(activeJourney);
    updated.lastActive = new Date().toISOString();
    const newJourneys = journeys.map((j) => (j.id === updated.id ? updated : j));
    setJourneys(newJourneys);
    saveJourneys(newJourneys);
  };

  const createJourney = (data: Omit<LearningJourney, 'id' | 'createdAt' | 'lastActive' | 'streakDays' | 'advisorData' | 'librarianData' | 'tutorData' | 'editorData' | 'roommateData'>): LearningJourney => {
    const newId = `journey-${Date.now()}`;
    const newJourney: LearningJourney = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      streakDays: 1,
      advisorData: {
        overview: `Mastery path for ${data.topic}`,
        estimatedWeeks: 6,
        phases: [],
        cutList: [],
        chatHistory: [
          {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            persona: 'advisor',
            content: `Welcome to your learning journey for **${data.topic}**! I am your Academic Advisor.`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      },
      librarianData: {
        sources: [],
        groundedNotes: [],
        flashcards: [],
        chatHistory: []
      },
      tutorData: {
        chatHistory: [],
        feynmanSessions: [],
        quizzes: []
      },
      editorData: {
        reviews: [],
        chatHistory: []
      },
      roommateData: {
        chatHistory: [],
        collisions: [],
        personaVibe: 'curious_nerd'
      }
    };

    addJourney(newJourney);
    return newJourney;
  };

  const deleteJourney = (id: string) => {
    const filtered = journeys.filter((j) => j.id !== id);
    setJourneys(filtered);
    saveJourneys(filtered);
    if (activeJourneyId === id) {
      const nextId = filtered[0]?.id || null;
      setActiveJourneyIdState(nextId);
      if (nextId) setStoredActiveJourneyId(nextId);
    }
  };

  const addChatMessage = (persona: AlterPersona, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    updateActiveJourney((prev) => {
      const updated = { ...prev };
      if (persona === 'advisor') {
        updated.advisorData.chatHistory = [...updated.advisorData.chatHistory, newMsg];
      } else if (persona === 'librarian') {
        updated.librarianData.chatHistory = [...updated.librarianData.chatHistory, newMsg];
      } else if (persona === 'tutor') {
        updated.tutorData.chatHistory = [...updated.tutorData.chatHistory, newMsg];
      } else if (persona === 'editor') {
        updated.editorData.chatHistory = [...updated.editorData.chatHistory, newMsg];
      } else if (persona === 'roommate') {
        updated.roommateData.chatHistory = [...updated.roommateData.chatHistory, newMsg];
      }
      return updated;
    });
  };

  return (
    <JourneyContext.Provider
      value={{
        journeys,
        activeJourney,
        activePersona,
        apiKey,
        isApiKeyModalOpen,
        isCreateModalOpen,
        setActiveJourneyId,
        setActivePersona,
        setApiKey,
        setIsApiKeyModalOpen,
        setIsCreateModalOpen,
        addJourney,
        createJourney,
        updateActiveJourney,
        deleteJourney,
        addChatMessage
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
