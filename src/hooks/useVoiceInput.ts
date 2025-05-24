import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  emma: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: (event: Event) => void;
  onerror: (event: Event & { error: string }) => void;
  onstart: (event: Event) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

const SpeechRecognitionAPI = 
  (window as any).SpeechRecognition || 
  (window as any).webkitSpeechRecognition || 
  null;

interface UseVoiceInputOptions {
  language?: string;
  maxDuration?: number;
  minDuration?: number;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseVoiceInputReturn {
  transcript: string;
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

/**
 * Custom hook for voice input using the Web Speech API
 * Supports Japanese language recognition for WaniKani reviews
 */
export const useVoiceInput = ({
  language = 'ja-JP',
  maxDuration = 10000, // 10 seconds max as per PRD
  minDuration = 500, // 0.5 seconds min as per PRD
  continuous = false,
  interimResults = true,
}: UseVoiceInputOptions = {}): UseVoiceInputReturn => {
  const [transcript, setTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const isSupported = SpeechRecognitionAPI !== null;

  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onstart = null;
      recognitionRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    cleanupRecognition();
    
    try {
      const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
      
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.resultIndex];
        const transcriptValue = result[0].transcript;
        
        setTranscript(transcriptValue);
        
        if (result.isFinal) {
          setIsProcessing(true);
          setTimeout(() => {
            setIsProcessing(false);
          }, 500);
        }
      };
      
      recognition.onend = () => {
        const duration = Date.now() - startTimeRef.current;
        
        if (duration < minDuration) {
          setError('Recording too short. Please speak longer.');
        }
        
        setIsRecording(false);
        cleanupRecognition();
      };
      
      recognition.onerror = (event: Event & { error: string }) => {
        switch (event.error) {
          case 'no-speech':
            setError('No speech detected. Please try again.');
            break;
          case 'aborted':
            break;
          case 'audio-capture':
            setError('No microphone detected. Please check your device.');
            break;
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone access.');
            break;
          case 'network':
            setError('Network error. Please check your connection.');
            break;
          case 'service-not-allowed':
            setError('Speech recognition service not allowed.');
            break;
          default:
            setError(`Error: ${event.error}`);
        }
        
        setIsRecording(false);
        cleanupRecognition();
      };
      
      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
        startTimeRef.current = Date.now();
      };
      
      recognitionRef.current = recognition;
      
      recognition.start();
      
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, maxDuration);
      
    } catch (err) {
      setError('Failed to start speech recognition');
      setIsRecording(false);
      console.error('Speech recognition error:', err);
    }
  }, [isSupported, continuous, interimResults, language, minDuration, maxDuration, cleanupRecognition]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecognition();
    };
  }, [cleanupRecognition]);

  return {
    transcript,
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    isSupported,
  };
};

export default useVoiceInput;
