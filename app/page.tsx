import { HierarchicalTable } from "./components/HierarchicalTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100 font-sans">
      <main className="page-wrap">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">
          Hierarchical Allocation Table
        </h1>
        <HierarchicalTable />
      </main>
    </div>
  );
}
