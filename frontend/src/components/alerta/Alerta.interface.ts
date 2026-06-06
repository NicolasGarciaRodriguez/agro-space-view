export type AlertaType = "info" | "warning" | "error" | "success";

export interface AlertaProps {
  type: AlertaType;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
  onClose?: () => void;
}
