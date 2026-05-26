import DashboardStats from "@/app/_components/dashboard-stats";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-zinc-100">Dashboard</h1>
      <DashboardStats />
    </div>
  );
}
