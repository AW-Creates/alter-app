import React, { createContext, useContext, useState, useEffect } from 'react';
import { LearningJourney, AlterPersona, ChatMessage } from '../types/alter';
import {
  getStoredJourneys,
  saveJourneys,
  getStoredActiveJourneyId,
  setStoredActiveJourneyId
} from '../services/storage';
import { getStoredApiKey, setStoredApiKey, getSimulatedCurriculum, getSimulatedSources } from '../services/gemini';

interface JourneyContextType {
  journeys: LearningJourney[];
  activeJourney: LearningJourney | null;
  activePersona: AlterPersona;
  apiKey: string;
  isApiKeyModalOpen: boolean;
  isCreateModalOpen: boolean;
  isOnboardingTourOpen: boolean;
  targetTutorConcept: string | null;
  editorDraftPayload: string | null;
  setActiveJourneyId: (id: string) => void;
  setActivePersona: (persona: AlterPersona) => void;
  setApiKey: (key: string) => void;
  setIsApiKeyModalOpen: (open: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsOnboardingTourOpen: (open: boolean) => void;
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
  const [isOnboardingTourOpen, setIsOnboardingTourOpen] = useState<boolean>(false);
  const [targetTutorConcept, setTargetTutorConcept] = useState<string | null>(null);
  const [editorDraftPayload, setEditorDraftPayload] = useState<string | null>(null);

  useEffect(() => {
    let loadedJourneys = getStoredJourneys();
    
    // Auto-repair any journey that has 0 phases or missing sources
    let repaired = false;
    loadedJourneys = loadedJourneys.map((j) => {
      if (!j.advisorData?.phases || j.advisorData.phases.length === 0) {
        repaired = true;
        const initialCurriculum = getSimulatedCurriculum(j.topic || j.title, j.destination);
        const initialSources = getSimulatedSources(j.topic || j.title);
        return {
          ...j,
          advisorData: {
            ...initialCurriculum,
            chatHistory: j.advisorData?.chatHistory?.length
              ? j.advisorData.chatHistory
              : [
                  {
                    id: `msg-${Date.now()}`,
                    sender: 'assistant',
                    persona: 'advisor',
                    content: `Welcome to **${j.topic || j.title}**! I've engineered your ${initialCurriculum.estimatedWeeks}-week modular curriculum and locked in your **Cut List**. Check out Phase 1 and start **Course 1.1** below to begin.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]
          },
          librarianData: {
            ...j.librarianData,
            sources: j.librarianData?.sources?.length ? j.librarianData.sources : initialSources
          }
        };
      }
      return j;
    });

    if (repaired) {
      saveJourneys(loadedJourneys);
    }

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
    const initialCurriculum = getSimulatedCurriculum(data.topic, data.destination);
    const initialSources = getSimulatedSources(data.topic);

    const newJourney: LearningJourney = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      streakDays: 1,
      advisorData: {
        ...initialCurriculum,
        chatHistory: [
          {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            persona: 'advisor',
            content: `Welcome to **${data.topic}**! I am your Academic Advisor. I've prepared your 3-Phase structured curriculum with step-by-step courses. Let's start with **Course 1.1**!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      },
      librarianData: {
        sources: initialSources,
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
        isOnboardingTourOpen,
        targetTutorConcept,
        editorDraftPayload,
        setActiveJourneyId,
        setActivePersona,
        setApiKey,
        setIsApiKeyModalOpen,
        setIsCreateModalOpen,
        setIsOnboardingTourOpen,
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
