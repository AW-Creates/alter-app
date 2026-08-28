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
  targetTutorConcept: string | null;
  editorDraftPayload: string | null;
  setActiveJourneyId: (id: string) => void;
  setActivePersona: (persona: AlterPersona) => void;
  setApiKey: (key: string) => void;
  setIsApiKeyModalOpen: (open: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  navigateToTutorConcept: (concept: string) => void;
  sendToEditor: (draft: string) => void;
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
  const [targetTutorConcept, setTargetTutorConcept] = useState<string | null>(null);
  const [editorDraftPayload, setEditorDraftPayload] = useState<string | null>(null);

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
    setJourneys((prevJourneys) => {
      const currentTargetId = activeJourneyId || (prevJourneys.length > 0 ? prevJourneys[0].id : null);
      if (!currentTargetId) return prevJourneys;
      const targetIndex = prevJourneys.findIndex((j) => j.id === currentTargetId);
      if (targetIndex === -1) return prevJourneys;

      const targetJourney = prevJourneys[targetIndex];
      const updated = updater(targetJourney);
      updated.lastActive = new Date().toISOString();

      const newJourneys = [...prevJourneys];
      newJourneys[targetIndex] = updated;
      saveJourneys(newJourneys);
      return newJourneys;
    });
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

    setJourneys((prevJourneys) => {
      const nextJourneys = [newJourney, ...prevJourneys];
      saveJourneys(nextJourneys);
      return nextJourneys;
    });
    setActiveJourneyId(newId);
    return newJourney;
  };

  const deleteJourney = (id: string) => {
    setJourneys((prevJourneys) => {
      const remaining = prevJourneys.filter((j) => j.id !== id);
      saveJourneys(remaining);
      if (activeJourneyId === id) {
        const nextId = remaining.length > 0 ? remaining[0].id : null;
        setActiveJourneyIdState(nextId);
        if (nextId) {
          setStoredActiveJourneyId(nextId);
        } else {
          try {
            localStorage.removeItem('alter_active_journey_id_v1');
          } catch {}
        }
      }
      return remaining;
    });
  };

  const addChatMessage = (persona: AlterPersona, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    updateActiveJourney((prev) => {
      const newMessage: ChatMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      switch (persona) {
        case 'advisor':
          return {
            ...prev,
            advisorData: {
              ...prev.advisorData,
              chatHistory: [...(prev.advisorData?.chatHistory || []), newMessage]
            }
          };
        case 'librarian':
          return {
            ...prev,
            librarianData: {
              ...prev.librarianData,
              chatHistory: [...(prev.librarianData?.chatHistory || []), newMessage]
            }
          };
        case 'tutor':
          return {
            ...prev,
            tutorData: {
              ...prev.tutorData,
              chatHistory: [...(prev.tutorData?.chatHistory || []), newMessage]
            }
          };
        case 'editor':
          return {
            ...prev,
            editorData: {
              ...prev.editorData,
              chatHistory: [...(prev.editorData?.chatHistory || []), newMessage]
            }
          };
        case 'roommate':
          return {
            ...prev,
            roommateData: {
              ...prev.roommateData,
              chatHistory: [...(prev.roommateData?.chatHistory || []), newMessage]
            }
          };
        default:
          return prev;
      }
    });
  };

  const navigateToTutorConcept = (concept: string) => {
    setTargetTutorConcept(concept);
    setActivePersona('tutor');
  };

  const sendToEditor = (draft: string) => {
    setEditorDraftPayload(draft);
    setActivePersona('editor');
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
        targetTutorConcept,
        editorDraftPayload,
        setActiveJourneyId,
        setActivePersona,
        setApiKey,
        setIsApiKeyModalOpen,
        setIsCreateModalOpen,
        navigateToTutorConcept,
        sendToEditor,
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
