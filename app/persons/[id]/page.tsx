import { getPerson } from "@/src/server/actions/persons";
import MonthlyGrid from "@/app/_components/monthly-grid";
import { notFound } from "next/navigation";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getPerson(id);

  if (!result.success) {
    notFound();
  }

  const person = result.data;

  return (
    <div>
      <MonthlyGrid personId={person.id} personName={person.name} />
    </div>
  );
}
