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
  setApiKey: (key: string) => void;
  setIsApiKeyModalOpen: (open: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
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

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    setStoredApiKey(key);
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
            content: `Welcome to your learning journey for **${data.topic}**! I am your Academic Advisor. Click "Generate Custom Curriculum" to formulate your study plan, milestones, and crucial **Cut List**.`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      },
      librarianData: {
        sources: [],
        vaultNotes: [],
        conceptCards: [],
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

    const nextJourneys = [newJourney, ...journeys];
    setJourneys(nextJourneys);
    saveJourneys(nextJourneys);
    setActiveJourneyId(newId);
    return newJourney;
  };

  const deleteJourney = (id: string) => {
    const remaining = journeys.filter((j) => j.id !== id);
    setJourneys(remaining);
    saveJourneys(remaining);
    if (activeJourneyId === id) {
      const nextId = remaining.length > 0 ? remaining[0].id : null;
      setActiveJourneyIdState(nextId);
      if (nextId) setStoredActiveJourneyId(nextId);
    }
  };

  const addChatMessage = (persona: AlterPersona, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    updateActiveJourney((prev) => {
      const newMessage: ChatMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const clone = { ...prev };
      switch (persona) {
        case 'advisor':
          clone.advisorData.chatHistory = [...clone.advisorData.chatHistory, newMessage];
          break;
        case 'librarian':
          clone.librarianData.chatHistory = [...clone.librarianData.chatHistory, newMessage];
          break;
        case 'tutor':
          clone.tutorData.chatHistory = [...clone.tutorData.chatHistory, newMessage];
          break;
        case 'editor':
          clone.editorData.chatHistory = [...clone.editorData.chatHistory, newMessage];
          break;
        case 'roommate':
          clone.roommateData.chatHistory = [...clone.roommateData.chatHistory, newMessage];
          break;
      }
      return clone;
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
