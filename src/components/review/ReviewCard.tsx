import React from 'react';
import { ReviewItem } from '@/types/wanikani';
import Button from '@/components/common/Button';
import VoiceInputButton from '@/components/common/VoiceInputButton';
import { useReviewSessionStore } from '@/stores/reviewSessionStore';

interface ReviewCardProps {
  item: ReviewItem;
  onAnswer: (isCorrect: boolean) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ item, onAnswer }) => {
  const [answer, setAnswer] = React.useState('');
  const [isRecognizing, setIsRecognizing] = React.useState(false);
  const { currentSession } = useReviewSessionStore();
  
  const voiceEnabled = currentSession?.settings?.voiceEnabled ?? true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isCorrect = !!(
      item.meanings.some((meaning: string) => meaning.toLowerCase() === answer.toLowerCase()) ||
      (item.readings &&
        item.readings.some((reading: string) => reading.toLowerCase() === answer.toLowerCase()))
    );

    onAnswer(isCorrect);
    setAnswer('');
  };

  const handleTranscriptChange = (transcript: string) => {
    if (transcript) {
      setAnswer(transcript);
      setIsRecognizing(true);
    } else {
      setIsRecognizing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md w-full">
      <div className="mb-6 text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {item.subjectType.toUpperCase()}
        </span>
        <h2 className="text-4xl font-bold mt-2 mb-4">{item.characters || '[Radical]'}</h2>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {item.object === 'radical' ? 'Name' : 'Meaning'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your answer..."
            required
          />
        </div>

        <div className="flex space-x-2">
          {voiceEnabled && (
            <VoiceInputButton
              onTranscriptChange={handleTranscriptChange}
              className="flex-1"
              language="ja-JP"
            />
          )}

          <Button type="submit" variant="primary" className="flex-1" disabled={!answer.trim()}>
            Submit
          </Button>
        </div>
        
        {isRecognizing && (
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Voice recognized. Press Submit to confirm or edit the text above.
          </div>
        )}
      </form>
    </div>
  );
};

export default ReviewCard;
