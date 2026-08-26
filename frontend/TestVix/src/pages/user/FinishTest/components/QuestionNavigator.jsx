import React from 'react';

const QuestionNavigator = ({ questions, scrollToQuestion, activeQuestionId, isOpen, onClose, test, selectedAnswers }) => {
  const getQuestionStatus = (question) => {

    const selectedAnswer = selectedAnswers[question.id];
    if (selectedAnswer.is_checked === false) return 'skipped';

    const correctAnswerIndex = selectedAnswer.is_true
    return correctAnswerIndex ? 'correct' : 'incorrect';
  };

  return (
    <div className={`question-navigator-container ${isOpen ? 'open' : ''}`}>
      <div className="question-navigator-backdrop" onClick={onClose}></div>
      <div className="question-navigator">
        <div className="navigator-header">
          <h3 className="navigator-title">Savollar ({questions.length})</h3>
          <button className="close-nav-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="test-info-mini">
          <p className="test-name-mini">{test.nom}</p>
        </div>

        {/* <div className="navigator-stats">
          <div className="stat-item correct">
            <i className="bi bi-check-circle-fill"></i>
            <span>{questions.filter(q => getQuestionStatus(q) === 'correct').length} to'g'ri</span>
          </div>
          <div className="stat-item incorrect">
            <i className="bi bi-x-circle-fill"></i>
            <span>{questions.filter(q => getQuestionStatus(q) === 'incorrect').length} noto'g'ri</span>
          </div>
        </div> */}

        <div className="navigator-grid">
          {questions.map((question, index) => {
            const isActive = activeQuestionId === `question-${question.id}`;
            const status = getQuestionStatus(question);

            return (
              <button
                key={question.id}
                className={`navigator-button  ${status}`}
                onClick={() => scrollToQuestion(question.id)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator;
