import { renderHook, act } from '@testing-library/react';
import { useVoiceInput } from '../useVoiceInput';

const mockStart = jest.fn();
const mockStop = jest.fn();
const mockAbort = jest.fn();

let onresultMock: ((event: any) => void) | null = null;
let onendMock: ((event: any) => void) | null = null;
let onerrorMock: ((event: any) => void) | null = null;
let onstartMock: ((event: any) => void) | null = null;

class MockSpeechRecognition {
  continuous: boolean = false;
  interimResults: boolean = false;
  lang: string = '';
  maxAlternatives: number = 1;

  set onresult(handler: (event: any) => void) {
    onresultMock = handler;
  }

  set onend(handler: (event: any) => void) {
    onendMock = handler;
  }

  set onerror(handler: (event: any) => void) {
    onerrorMock = handler;
  }

  set onstart(handler: (event: any) => void) {
    onstartMock = handler;
  }

  start() {
    mockStart();
    if (onstartMock) onstartMock({});
  }

  stop() {
    mockStop();
    if (onendMock) onendMock({});
  }

  abort() {
    mockAbort();
  }
}

Object.defineProperty(window, 'SpeechRecognition', {
  value: MockSpeechRecognition,
  writable: true,
});

jest.useFakeTimers();

describe('useVoiceInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    onresultMock = null;
    onendMock = null;
    onerrorMock = null;
    onstartMock = null;
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
    expect(result.current.error).toBeNull();
  });

  it('should stop recording when stopRecording is called', () => {
    const { result } = renderHook(() => useVoiceInput());

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);

    act(() => {
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
      if (onresultMock) {
        onresultMock({
          resultIndex: 0,
          results: [
            {
              isFinal: true,
              0: {
                transcript: 'こんにちは',
                confidence: 0.9,
              },
              length: 1,
            },
          ],
        });
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
      if (onerrorMock) {
        onerrorMock({ error: 'not-allowed' });
      }
    });

    expect(result.current.error).toBe('Microphone access denied. Please allow microphone access.');
    expect(result.current.isRecording).toBe(false);
  });

  it('should reset transcript when resetTranscript is called', () => {
    const { result } = renderHook(() => useVoiceInput());

    act(() => {
      result.current.startRecording();
    });

    act(() => {
      if (onresultMock) {
        onresultMock({
          resultIndex: 0,
          results: [
            {
              isFinal: true,
              0: {
                transcript: 'こんにちは',
                confidence: 0.9,
              },
              length: 1,
            },
          ],
        });
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
    const mockDateNow = jest.fn()
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1500); // End time (500ms duration, less than minDuration)
    
    Date.now = mockDateNow;

    act(() => {
      result.current.startRecording();
    });

    act(() => {
      if (onendMock) {
        onendMock({});
      }
    });

    expect(result.current.error).toBe('Recording too short. Please speak longer.');
    
    Date.now = originalDateNow;
  });

  it('should handle unsupported browsers', () => {
    const originalSpeechRecognition = window.SpeechRecognition;
    Object.defineProperty(window, 'SpeechRecognition', {
      value: null,
      writable: true,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: null,
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
  });
});
