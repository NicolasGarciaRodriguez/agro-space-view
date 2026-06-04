import { ParcelaDetail } from "./components/parcelaDetail/ParcelaDetail.component";

interface ParcelaPageProps {
  params: Promise<{ id: string }>;
}

export default async function ParcelaPage({ params }: ParcelaPageProps) {
  const { id } = await params;
  return <ParcelaDetail id={id} />;
}
