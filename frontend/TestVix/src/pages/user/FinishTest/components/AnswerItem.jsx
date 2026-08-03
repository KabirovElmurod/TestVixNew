import React from 'react';

const AnswerItem = ({ variant, variantIndex, isSelected, isCorrectAnswer }) => {
  const getAnswerStatus = () => {
    if (isCorrectAnswer) return 'correct';
    if (isSelected && !isCorrectAnswer) return 'incorrect';
    return 'default';
  };

  const status = getAnswerStatus();
  const prefix = String.fromCharCode(65 + variantIndex);

  return (
    <div className={`option-item ${status}`}>
      <span className="prefix">{prefix}</span>
      <span className="text">{variant.text}</span>
      {status === 'correct' && (
        <i className="bi bi-check-circle-fill status-icon"></i>
      )}
      {status === 'incorrect' && (
        <i className="bi bi-x-circle-fill status-icon"></i>
      )}
    </div>
  );
};

export default AnswerItem;
