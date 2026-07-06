export interface ParcelaFormValues {
  refCatastral: string;
  nombre: string;
  tipoCultivo: string; // TipoCultivo | ""
  variedad: string;
  manejo: string; // ManejoCultivo
}

export interface ParcelaFormProps {
  isLoading: boolean;
  error: string | null;
  onSubmit: (values: ParcelaFormValues) => void;
  submitLabel: string;
  children?: React.ReactNode; // para botones extra (cancelar, skip...)
}
