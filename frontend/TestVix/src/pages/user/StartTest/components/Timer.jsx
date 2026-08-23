import React, { useState, useEffect } from 'react';

const Timer = ({ duration, onTimeUp, isRunning }) => {
  const validDuration =
    duration && !isNaN(duration) ? Number(duration) : 0;

  const [timeLeft, setTimeLeft] = useState(validDuration * 60);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 300) return 'text-green-600';
    if (timeLeft > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`timer-display ${getTimeColor()}`}>
      <i className="bi bi-clock"></i>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;