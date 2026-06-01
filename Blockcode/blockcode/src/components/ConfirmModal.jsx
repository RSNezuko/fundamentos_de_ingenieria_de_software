import "./ConfirmModal.css";

export default function ConfirmModal({ text, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="modal-popup">
                <div className="modal-header">
                    <div className="modal-icon">⚠️</div>
                    <h3>Confirm Action</h3>
                </div>
                <div className="modal-body">
                    <p>{text}</p>
                </div>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn-confirm" onClick={onConfirm}>
                        Yes, Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}