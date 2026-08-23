import React from 'react';
import Timer from './Timer';

const QuestionNavigator = ({
  questions,
  scrollToQuestion,
  activeQuestionId,
  isOpen,
  onClose,
  answeredQuestions,
  test,
  time,
  is_time,
  isTimerRunning,
  onTimeUp,
  handleSubmitTest
}) => {

  return (
    <div className={`question-navigator-container ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="question-navigator" onClick={(e) => e.stopPropagation()}>
        <div className="navigator-header">
          <h3 className="navigator-title">Savollar</h3>
          <button className="close-nav-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {isTimerRunning && (
          <div className="navigator-timer-section">
            <div className="timer-section">
              {
                test ? (
                  <Timer
                    // duration={13}
                    duration={Number(time)}
                    is_time={is_time}
                    onTimeUp={onTimeUp}
                    isRunning={isTimerRunning}
                  />
                )
                  :
                  (
                    <Timer
                      duration={3600}
                      onTimeUp={onTimeUp}
                      isRunning={isTimerRunning}
                    />
                  )
              }
            </div>
            <button className="submit-btn" onClick={handleSubmitTest}>
              <i className="bi bi-check-circle-fill"></i>
              <span>Testni tugatish</span>
            </button>
          </div>
        )}

        <div className="navigator-stats">
          <span className="answered-count">
            Javob berilgan: {Object.keys(answeredQuestions).length} / {questions.length}
          </span>
        </div>

        <div className="navigator-grid">
          {questions.map((q, index) => (
            <button
              key={q.id}
              className={`navigator-button ${activeQuestionId === q.id ? 'active' : ''
                } ${answeredQuestions[q.id] ? 'answered' : ''}`}
              onClick={() => scrollToQuestion(q.id)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(QuestionNavigator);
