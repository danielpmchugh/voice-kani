import React from 'react';
import Button from './Button';
import useVoiceInput from '@/hooks/useVoiceInput';

interface VoiceInputButtonProps {
  onTranscriptChange: (transcript: string) => void;
  className?: string;
  language?: string;
}

/**
 * Voice input button component with visual recording indicator
 * Integrates with the useVoiceInput hook for speech recognition
 */
const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscriptChange,
  className = '',
  language = 'ja-JP',
}) => {
  const {
    transcript,
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    isSupported,
  } = useVoiceInput({
    language,
    continuous: false,
    interimResults: true,
  });

  React.useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getButtonVariant = () => {
    if (error) return 'secondary';
    if (isRecording) return 'primary';
    if (isProcessing) return 'outline';
    return 'outline';
  };

  const getButtonText = () => {
    if (!isSupported) return 'Voice Input Not Supported';
    if (error) return 'Try Again';
    if (isRecording) return 'Stop Recording';
    if (isProcessing) return 'Processing...';
    return 'Start Voice Input';
  };

  const animationClass = isRecording
    ? 'animate-pulse transition-opacity duration-500'
    : '';

  return (
    <div className="relative">
      <Button
        type="button"
        variant={getButtonVariant()}
        onClick={handleClick}
        disabled={!isSupported || isProcessing}
        className={`flex items-center justify-center ${animationClass} ${className}`}
      >
        {/* Microphone icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 mr-2 ${isRecording ? 'text-red-500' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
        {getButtonText()}
      </Button>
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
};

export default VoiceInputButton;
