/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useVoiceInput } from '../useVoiceInput';

interface MockSpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface MockSpeechRecognitionResultList {
  [index: number]: {
    [index: number]: MockSpeechRecognitionResult;
    isFinal: boolean;
    length: number;
  };
  length: number;
}

interface MockSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: MockSpeechRecognitionResultList;
}

interface MockSpeechRecognitionErrorEvent extends Event {
  error: string;
}

const mockStart = jest.fn();
const mockStop = jest.fn();
const mockAbort = jest.fn();

let mockOnResult: ((event: MockSpeechRecognitionEvent) => void) | null = null;
let mockOnEnd: ((event: Event) => void) | null = null;
let mockOnError: ((event: MockSpeechRecognitionErrorEvent) => void) | null = null;
let mockOnStart: ((event: Event) => void) | null = null;

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  maxAlternatives = 1;

  set onresult(handler: ((event: MockSpeechRecognitionEvent) => void) | null) {
    mockOnResult = handler;
  }

  set onend(handler: ((event: Event) => void) | null) {
    mockOnEnd = handler;
  }

  set onerror(handler: ((event: MockSpeechRecognitionErrorEvent) => void) | null) {
    mockOnError = handler;
  }

  set onstart(handler: ((event: Event) => void) | null) {
    mockOnStart = handler;
  }

  start() {
    mockStart();
    if (mockOnStart) {
      mockOnStart(new Event('start'));
    }
  }

  stop() {
    mockStop();
    if (mockOnEnd) {
      mockOnEnd(new Event('end'));
    }
  }

  abort() {
    mockAbort();
  }
}

const createMockResultEvent = (transcript: string, isFinal = true): MockSpeechRecognitionEvent => {
  const event = new Event('result') as MockSpeechRecognitionEvent;
  event.resultIndex = 0;
  event.results = {
    0: {
      0: { transcript, confidence: 0.9 },
      isFinal,
      length: 1,
    },
    length: 1,
  };
  return event;
};

const createMockErrorEvent = (errorType: string): MockSpeechRecognitionErrorEvent => {
  const event = new Event('error') as MockSpeechRecognitionErrorEvent;
  event.error = errorType;
  return event;
};

describe('useVoiceInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnResult = null;
    mockOnEnd = null;
    mockOnError = null;
    mockOnStart = null;

    Object.defineProperty(window, 'SpeechRecognition', {
      value: MockSpeechRecognition,
      writable: true,
    });

    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: MockSpeechRecognition,
      writable: true,
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useVoiceInput());

    expect(result.current.transcript).toBe('');
    expect(result.current.isRecording).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isSupported).toBe(true);
  });

  it('should start recording when startRecording is called', () => {
    const { result } = renderHook(() => useVoiceInput());

    act(() => {
      result.current.startRecording();
    });

    expect(mockStart).toHaveBeenCalled();
    expect(result.current.isRecording).toBe(true);
  });

  it('should stop recording when stopRecording is called', () => {
    const { result } = renderHook(() => useVoiceInput());

    act(() => {
      result.current.startRecording();
      result.current.stopRecording();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(result.current.isRecording).toBe(false);
  });

  it('should update transcript when speech is recognized', () => {
    const { result } = renderHook(() => useVoiceInput());

    act(() => {
      result.current.startRecording();
    });

    act(() => {
      if (mockOnResult) {
        mockOnResult(createMockResultEvent('こんにちは', true));
      }
    });

    expect(result.current.transcript).toBe('こんにちは');
    expect(result.current.isProcessing).toBe(true);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.isProcessing).toBe(false);
  });

  it('should handle errors during speech recognition', () => {
    const { result } = renderHook(() => useVoiceInput());

    act(() => {
      result.current.startRecording();
    });

    act(() => {
      if (mockOnError) {
        mockOnError(createMockErrorEvent('not-allowed'));
      }
    });

    expect(result.current.error).toBe('Microphone access denied. Please allow microphone access.');
    expect(result.current.isRecording).toBe(false);
  });

  it('should reset transcript when resetTranscript is called', () => {
    const { result } = renderHook(() => useVoiceInput());

    act(() => {
      result.current.startRecording();
      if (mockOnResult) {
        mockOnResult(createMockResultEvent('こんにちは'));
      }
    });

    expect(result.current.transcript).toBe('こんにちは');

    act(() => {
      result.current.resetTranscript();
    });

    expect(result.current.transcript).toBe('');
  });

  it('should stop recording after maxDuration', () => {
    const { result } = renderHook(() => useVoiceInput({ maxDuration: 5000 }));

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockStop).toHaveBeenCalled();
  });

  it('should report error for short recordings', () => {
    const { result } = renderHook(() => useVoiceInput({ minDuration: 1000 }));

    const originalDateNow = Date.now;
    Date.now = jest
      .fn()
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1500); // End time (500ms duration, less than minDuration)

    act(() => {
      result.current.startRecording();
    });

    act(() => {
      if (mockOnEnd) {
        mockOnEnd(new Event('end'));
      }
    });

    expect(result.current.error).toBe('Recording too short. Please speak longer.');

    Date.now = originalDateNow;
  });

  it('should handle unsupported browsers', () => {
    const originalSpeechRecognition = window.SpeechRecognition;
    const originalWebkitSpeechRecognition = window.webkitSpeechRecognition;

    Object.defineProperty(window, 'SpeechRecognition', {
      value: undefined,
      writable: true,
    });

    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useVoiceInput());

    expect(result.current.isSupported).toBe(false);

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.error).toBe('Speech recognition is not supported in this browser');
    expect(mockStart).not.toHaveBeenCalled();

    Object.defineProperty(window, 'SpeechRecognition', {
      value: originalSpeechRecognition,
      writable: true,
    });

    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: originalWebkitSpeechRecognition,
      writable: true,
    });
  });
});
