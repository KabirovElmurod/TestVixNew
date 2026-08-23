import React from 'react';
import StarRating from './StarRating';
import { human_time } from '../../../../lib/func';

const TestInfo = ({ test }) => {
  return (
    <div className="test-info-section">
      <div className="test-card-content">
        <div className="test-main-info">
          <div className="test-badge-row">
            <span className="subject-badge">{test.fan}</span>
            <span className="id-badge">ID: {test.test_id}</span>
            <span className={`visibility-badge ${test.ispublic ? 'Public' : 'Private'}`}>
              <i className={`bi ${test.ispublic ? 'bi-globe' : 'bi-lock'}`}></i>
              {test.ispublic ? 'Public' : 'Private'}
            </span>
          </div>
          <h1 className="test-title">{test.nom}</h1>
          <p className="test-description">{test.tavsif}</p>
        </div>

        <div className="test-footer-stats">
          <div className="stat-group">
            <div className="stat-item">
              <div className="icon-box">
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="stat-content">
                <span className="stat-label">Vaqt</span>
                <span className="stat-value">{test.istime ? human_time(test.time) : <i className='bi bi-infinity'></i>}</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="icon-box">
                <i className="bi bi-award"></i>
              </div>
              <div className="stat-content">
                <span className="stat-label">Reyting</span>
                <StarRating rating={test.rating || 0} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInfo;
