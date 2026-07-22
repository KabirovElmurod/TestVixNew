import React from 'react';

const FinishTestModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="finish-test-modal-container">
      <div className="finish-test-modal-backdrop" onClick={onClose}></div>
      <div className="finish-test-modal">
        <div className="finish-test-modal-header">
          <h3>Testni tugatish</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="finish-test-modal-body">
          <p>Haqiqatan ham testni tugatishni xohlaysizmi?</p>
          <p className="warning-text">Tugatgandan so'ng javoblarni o'zgartirib bo'lmaydi.</p>
        </div>
        <div className="finish-test-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Yo'q, davom etish
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Ha, tugatish
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishTestModal;
