import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceInputButton from '../VoiceInputButton';
import useVoiceInput from '@/hooks/useVoiceInput';

jest.mock('@/hooks/useVoiceInput', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('VoiceInputButton', () => {
  const mockOnTranscriptChange = jest.fn();
  
  const defaultMockHook = {
    transcript: '',
    isRecording: false,
    isProcessing: false,
    error: null,
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    resetTranscript: jest.fn(),
    isSupported: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnTranscriptChange.mockClear();
    (useVoiceInput as jest.Mock).mockReturnValue(defaultMockHook);
  });

  it('renders correctly in idle state', () => {
    render(<VoiceInputButton onTranscriptChange={mockOnTranscriptChange} />);
    
    expect(screen.getByText('Start Voice Input')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveClass('animate-pulse');
  });

  it('renders correctly in recording state', () => {
    (useVoiceInput as jest.Mock).mockReturnValue({
      ...defaultMockHook,
      isRecording: true,
    });
    
    render(<VoiceInputButton onTranscriptChange={mockOnTranscriptChange} />);
    
    expect(screen.getByText('Stop Recording')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('animate-pulse');
  });

  it('renders correctly in processing state', () => {
    (useVoiceInput as jest.Mock).mockReturnValue({
      ...defaultMockHook,
      isProcessing: true,
    });
    
    render(<VoiceInputButton onTranscriptChange={mockOnTranscriptChange} />);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders correctly in error state', () => {
    (useVoiceInput as jest.Mock).mockReturnValue({
      ...defaultMockHook,
      error: 'Microphone access denied',
    });
    
    render(<VoiceInputButton onTranscriptChange={mockOnTranscriptChange} />);
    
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Microphone access denied')).toBeInTheDocument();
  });

  it('renders correctly when speech recognition is not supported', () => {
    (useVoiceInput as jest.Mock).mockReturnValue({
      ...defaultMockHook,
      isSupported: false,
    });
    
    render(<VoiceInputButton onTranscriptChange={mockOnTranscriptChange} />);
    
    expect(screen.getByText('Voice Input Not Supported')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('starts recording when clicked in idle state', () => {
    render(<VoiceInputButton onTranscriptChange={mockOnTranscriptChange} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(defaultMockHook.startRecording).toHaveBeenCalled();
  });

  it('stops recording when clicked in recording state', () => {
    (useVoiceInput as jest.Mock).mockReturnValue({
      ...defaultMockHook,
      isRecording: true,
    });
    
    render(<VoiceInputButton onTranscriptChange={mockOnTranscriptChange} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(defaultMockHook.stopRecording).toHaveBeenCalled();
  });

  it('calls onTranscriptChange when transcript changes', () => {
    const hookWithTranscript = {
      ...defaultMockHook,
      transcript: 'こんにちは',
    };
    
    (useVoiceInput as jest.Mock).mockReturnValue(hookWithTranscript);
    
    const { rerender } = render(<VoiceInputButton onTranscriptChange={mockOnTranscriptChange} />);
    
    expect(mockOnTranscriptChange).toHaveBeenCalledWith('こんにちは');
    
    (useVoiceInput as jest.Mock).mockReturnValue({
      ...hookWithTranscript,
      transcript: 'さようなら',
    });
    
    rerender(<VoiceInputButton onTranscriptChange={mockOnTranscriptChange} />);
    
    expect(mockOnTranscriptChange).toHaveBeenCalledWith('さようなら');
  });

  it('passes language prop to useVoiceInput', () => {
    render(<VoiceInputButton onTranscriptChange={mockOnTranscriptChange} language="en-US" />);
    
    expect(useVoiceInput).toHaveBeenCalledWith(expect.objectContaining({
      language: 'en-US',
    }));
  });
});
