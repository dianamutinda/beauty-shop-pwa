
import { AlertTriangle, Trash2, Info } from 'lucide-react';

import Modal from './Modal';
import Button from './Button';

const variants = {
  danger: {
    icon: Trash2,
    iconStyles: 'bg-error/10 text-error',
    confirmVariant: 'danger',
  },
  warning: {
    icon: AlertTriangle,
    iconStyles: 'bg-warning/10 text-warning',
    confirmVariant: 'primary',
  },
  info: {
    icon: Info,
    iconStyles: 'bg-info/10 text-info',
    confirmVariant: 'primary',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'Please confirm that you want to continue.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const config = variants[variant] || variants.danger;
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      showCloseButton={!loading}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            fullWidth
            disabled={loading}
            onClick={onClose}
            className="sm:w-auto"
          >
            {cancelText}
          </Button>

          <Button
            variant={config.confirmVariant}
            fullWidth
            loading={loading}
            disabled={loading}
            onClick={handleConfirm}
            className="sm:w-auto"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconStyles}`}
        >
          <Icon size={20} aria-hidden="true" />
        </div>

        <p className="min-w-0 pt-1 text-sm leading-6 text-text-secondary">
          {message}
        </p>
      </div>
    </Modal>
  );
}
