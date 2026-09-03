export default function Modal({ title, onClose, children, footer, large = false }) {
    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <div className={`modal ${large ? 'modal--large' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h3 className="modal__title">{title}</h3>
                    <button className="modal__close" onClick={onClose} aria-label="Yopish">
                        ✕
                    </button>
                </div>
                <div className="modal__body">{children}</div>
                {footer && <div className="modal__footer">{footer}</div>}
            </div>
        </div>
    );
}