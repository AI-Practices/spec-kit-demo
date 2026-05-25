import DashboardStats from "@/app/_components/dashboard-stats";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardStats />
    </div>
  );
}
