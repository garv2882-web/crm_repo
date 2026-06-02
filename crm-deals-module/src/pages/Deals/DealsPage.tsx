import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import DealsTable from '../../components/deals/DealsTable';

export default function DealsPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <main className="p-6">
          <DealsTable />
        </main>
      </div>
    </div>
  );
}
