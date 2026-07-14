export interface DeleteExplotacionModalProps {
  explotacionId: string;
  explotacionNombre: string;
  onDeleted: () => void;
  onClose: () => void;
}