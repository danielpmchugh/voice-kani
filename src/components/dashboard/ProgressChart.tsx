import React from 'react';

interface ProgressChartProps {
  correctCount: number;
  incorrectCount: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ correctCount, incorrectCount }) => {
  const total = correctCount + incorrectCount;
  const correctPercentage = total > 0 ? (correctCount / total) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Review Progress</h3>

      <div className="flex justify-between mb-2">
        <span>Accuracy</span>
        <span>{correctPercentage.toFixed(1)}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="bg-green-600 h-2.5 rounded-full"
          style={{ width: `${correctPercentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {correctCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
        </div>
        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{incorrectCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
