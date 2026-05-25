import AddExpenseForm from "@/app/_components/add-expense-form";

export default function ExpensesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Expenses</h1>
      <AddExpenseForm />
    </div>
  );
}
