import React, { useEffect, useRef } from 'react';
import 'mathlive';

const MathModal = ({ isOpen, onClose, onConfirm, initialValue }) => {
  const mfRef = useRef(null);

  useEffect(() => {
    // mfRef.current.value = 'salom';
    if (isOpen && mfRef.current) {
      mfRef.current.value = initialValue; // Matematik ifodani inputga yuklash
      // Modal ochilganda avtomatik fokusni formula kiritish maydoniga o'tkazish
      setTimeout(() => {
        mfRef.current.focus();
      }, 100);
    } else if (!isOpen && mfRef.current) {
      mfRef.current.value = ''; // Modal yopilganda qiymatni tozalash
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (mfRef.current) {
      // MathLive dan LaTeX qiymatini olish
      onConfirm(mfRef.current.value);
    }
  };

  return (
    <div className="math-modal-overlay" onClick={onClose}>
      <div className="math-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="title">
            <i className="bi bi-calculator"></i>
            <span>Matematik ifoda muharriri</span>
          </div>
          <button className="close-icon" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="mathfield-wrapper">
            <math-field 
              ref={mfRef} 
              style={{ 
                width: '100%', 
                fontSize: '1.5rem',
                background: 'transparent',
                padding: '12px'
              }}
              // onKeyDown={(e) => {
              //   if (e.key === 'Enter') {
              //     e.preventDefault();                  
              //     handleConfirm();
              //   }
              // }}
            ></math-field>
          </div>
          <p className="hint">
            Klaviatura yoki virtual paneldan foydalanib formula kiriting
          </p>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Bekor qilish</button>
          <button className="confirm-btn" onClick={handleConfirm}>
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default MathModal;