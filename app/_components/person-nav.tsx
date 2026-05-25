import Link from "next/link";

interface PersonNavProps {
  personId: string;
  personName: string;
  activeTab: "credits" | "debits";
}

const tabs = [
  { key: "credits", label: "Monthly Credits", href: (id: string) => `/persons/${id}` },
  { key: "debits", label: "Record Debit", href: (id: string) => `/persons/${id}/debits` },
] as const;

export default function PersonNav({ personId, personName, activeTab }: PersonNavProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/persons"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          &larr; All Persons
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{personName}</h1>
      </div>
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-700">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href(personId)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
