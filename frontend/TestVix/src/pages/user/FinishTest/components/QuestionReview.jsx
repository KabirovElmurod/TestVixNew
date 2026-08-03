import React from 'react';
import AnswerItem from './AnswerItem';

const QuestionReview = ({ question, index, selectedAnswer }) => {
  // const correctAnswerIndex = question.variantlar.findIndex(v => v.is_true);
  // const isCorrect = selectedAnswer === correctAnswerIndex;
  // const isSkipped = selectedAnswer === undefined;
  const isCorrect = selectedAnswer.is_true && selectedAnswer.is_checked === true
  const isSkipped = selectedAnswer.is_checked === false
  return (
    <div className={`question-card ${isCorrect ? 'correct' : isSkipped ? 'skipped' : 'incorrect'}`}>
      <div className="card-header">
        <div className="q-badge">
          <i className="bi bi-hash"></i>
          <span>Savol {index + 1}</span>
        </div>
        <div className={`status-badge ${isCorrect ? 'correct' : isSkipped ? 'skipped' : 'incorrect'}`}>
          {isCorrect ? (
            <><i className="bi bi-check-circle-fill"></i> To'g'ri</>
          ) : isSkipped ? (
            <><i className="bi bi-dash-circle-fill"></i> Javob berilmagan</>
          ) : (
            <><i className="bi bi-x-circle-fill"></i> Noto'g'ri</>
          )}
        </div>
      </div>

      <h2 className="question-body">
        {question.text}
      </h2>

      <div className="options-grid">
        {question.variantlar.map((variant, variantIndex) => {
          const isSelected = selectedAnswer.v_id == variant.id
          const isCorrectAnswer = selectedAnswer.is_true_id === variant.id;

          return (
            <AnswerItem
              key={variant.id}
              variant={variant}
              variantIndex={variantIndex}
              isSelected={isSelected}
              isCorrectAnswer={isCorrectAnswer}
            />
          );
        })}
      </div>
    </div>
  );
};

export default QuestionReview;
