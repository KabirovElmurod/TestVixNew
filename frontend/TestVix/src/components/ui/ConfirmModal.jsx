export default function ConfirmModal({ isOpen, onClose, onConfirm, testTitle, testId, isTest = true }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-container">
            <div className="confirm-modal-backdrop" onClick={onClose}></div>

            <div className="confirm-modal">
                <div className="confirm-modal-header">
                <h3>O'chirishni tasdiqlang</h3>
                </div>
                <div className="confirm-modal-body">
                  {
                    testTitle ? (
                      <p>Haqiqatan ham <b>"{testTitle}"</b> (ID: {testId}) {isTest ? 'testini' : 'savolni'} o'chirishni xohlaysizmi?</p>
                    ) : (
                      <p>Haqiqatan ham <b>"Savol-{testId+1}"</b> {isTest ? 'testni' : 'savolni'} o'chirishni xohlaysizmi?</p>
                    )
                  }
                </div>
                <div className="confirm-modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>Yo'q</button>
                <button className="btn btn-danger" onClick={onConfirm}>Ha</button>
                </div>
            </div>
    </div>
  );
}