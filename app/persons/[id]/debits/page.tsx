import { notFound } from "next/navigation";
import { getPerson } from "@/src/server/actions/persons";
import DebitForm from "@/app/_components/debit-form";
import PersonNav from "@/app/_components/person-nav";

export default async function DebitsPage({
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PersonNav personId={person.id} personName={person.name} activeTab="debits" />
      <DebitForm personId={person.id} personName={person.name} />
    </div>
  );
}
