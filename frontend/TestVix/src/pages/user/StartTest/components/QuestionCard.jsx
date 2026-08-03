import React, { useState } from 'react';
import SVGShow from '../../../../components/ui/SVGShow';
import MathText from '../../../../components/MathText';

const QuestionCard = ({ question, index, selectedAnswer, onAnswerSelect }) => {
  const [svg, setSvg] = useState('');
  const [json, setJson] = useState(() => {
    try {
      const parsed = JSON.parse(question.svg_json);
      return parsed.elements.length > 0 ? question.svg_json : null;
    } catch (e) {
      console.error('JSON parse error:', e);
      return null;
    }
  });

  const handleOptionClick = (optionIndex) => {
    onAnswerSelect?.(question.id, optionIndex);
  };

  return (
    <div className="question-card">
      <div className="card-header">
        <div className="q-badge">
          <i className="bi bi-hash"></i>
          <span>Savol {index + 1}</span>
        </div>
      </div>

      <h2 className="question-body">
        <MathText text={question.text} />
      </h2>

      {json && <SVGShow svg={svg} setSVG={setSvg} json={json} />}

      <div className="options-grid">
        {question.variantlar.map((option, optionIndex) => (
          <div
            key={optionIndex}
            className={`option-item ${selectedAnswer === option.id ? 'selected' : ''}`}
            onClick={() => handleOptionClick(optionIndex)}
          >
            <span className="prefix">{String.fromCharCode(65 + optionIndex)}</span>
            <span className="text">
              <MathText text={option.text} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
