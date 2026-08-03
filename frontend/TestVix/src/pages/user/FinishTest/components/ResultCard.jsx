import React from 'react';

const ResultCard = ({ results, test, onRetry, onBackToHome, onBackToTest }) => {
  // const { correctCount, totalQuestions, percentage, isPassed } = results;
  let percentage = (results.true_son / results.sum_son * 100).toFixed(0)
  let isPassed = true
  if (percentage < 60) {
    isPassed = false
  }
  let correctCount = results.true_son
  let totalQuestions = results.sum_son
  return (
    <div className="result-card">
      <div className="result-header">
        <div className={`result-icon ${isPassed ? 'passed' : 'failed'}`}>
          <i className={`bi ${isPassed ? 'bi-trophy-fill' : 'bi-x-circle-fill'}`}></i>
        </div>
        <h1 className="result-title">
          {isPassed ? 'Test muvaffaqiyatli yakunlandi!' : 'Test yakunlandi'}
        </h1>
        <p className="test-name">{test.nom}</p>
      </div>

      <div className="result-stats">
        <div className="stat-item">
          <div className="stat-value">{results.true_son}</div>
          <div className="stat-label">To'g'ri javoblar</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-value">{results.sum_son}</div>
          <div className="stat-label">Jami savollar</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className={`stat-value ${isPassed ? 'text-green' : 'text-red'}`}>
            {percentage}%
          </div>
          <div className="stat-label">Natija</div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div
            className={`progress-fill ${isPassed ? 'passed' : 'failed'}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {/* <div className="progress-label">
          {isPassed ? 'O\'tdingiz!' : 'O\'tmadingiz (60% talab qilinadi)'}
        </div> */}
      </div>

      <div className="result-details">
        <h3>Savollar tahlili</h3>
        <div className="details-grid">
          <div className="detail-item correct">
            <i className="bi bi-check-circle-fill"></i>
            <span>To'g'ri: {correctCount}</span>
          </div>
          <div className="detail-item incorrect">
            <i className="bi bi-x-circle-fill"></i>
            <span>Noto'g'ri: {totalQuestions - correctCount}</span>
          </div>
        </div>
      </div>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onBackToTest}>
          <i className="bi bi-eye"></i>
          Testga qaytish
        </button>
        <button className="btn btn-secondary" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise"></i>
          Qayta topshirish
        </button>
        <button className="btn btn-outline" onClick={onBackToHome}>
          <i className="bi bi-house"></i>
          Bosh sahifaga
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
