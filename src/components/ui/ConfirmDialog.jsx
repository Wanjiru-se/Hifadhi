/*
  Confirmation dialog for destructive actions such as Delete.
  Without onConfirm it becomes a simple notice with one OK button.
*/
import Button from './Button';
import Modal from './Modal';

export default function ConfirmDialog({ title, children, confirmLabel = 'Delete', onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-muted" style={{ margin: 0 }}>{children}</p>
      <div className="form-actions">
        {onConfirm ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" icon="trash" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>OK</Button>
        )}
      </div>
    </Modal>
  );
}
