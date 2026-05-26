import Link from "next/link";

interface PersonNavProps {
  personId: string;
  personName: string;
  activeTab: "credits" | "debits" | "summary";
}

const tabs = [
  { key: "credits", label: "Monthly Credits", href: (id: string) => `/persons/${id}` },
  { key: "debits", label: "Record Debit", href: (id: string) => `/persons/${id}/debits` },
  { key: "summary", label: "Summary", href: (id: string) => `/persons/${id}/summary` },
] as const;

export default function PersonNav({ personId, personName, activeTab }: PersonNavProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/persons"
          className="text-sm text-zinc-500 hover:text-accent transition-colors"
        >
          &larr; All Persons
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{personName}</h1>
      </div>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href(personId)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-zinc-500 hover:text-accent dark:text-zinc-400 dark:hover:text-accent"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
