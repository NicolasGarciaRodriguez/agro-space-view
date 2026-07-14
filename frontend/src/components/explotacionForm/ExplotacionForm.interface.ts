export interface ExplotacionFormValues {
  nombre: string;
  provincia: string;
  municipio: string;
  descripcion: string;
}

export interface ExplotacionFormProps {
  isLoading: boolean;
  error: string | null;
  onSubmit: (values: ExplotacionFormValues) => void;
  submitLabel: string;
  children?: React.ReactNode;
}