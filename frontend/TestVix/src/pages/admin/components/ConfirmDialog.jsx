import Modal from './Modal';

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
    return (
        <Modal
            title={title}
            onClose={onCancel}
            footer={
                <>
                    <button className="btn btn--ghost" onClick={onCancel}>
                        Bekor qilish
                    </button>
                    <button className="btn btn--danger" onClick={onConfirm}>
                        O'chirish
                    </button>
                </>
            }
        >
            <p className="confirm-message">{message}</p>
        </Modal>
    );
}