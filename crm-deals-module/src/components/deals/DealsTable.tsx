import { dealsData } from '../../mock/dealsData';

export default function DealsTable() {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left">Deal Name</th>
            <th className="px-6 py-4 text-left">Company</th>
            <th className="px-6 py-4 text-left">Stage</th>
          </tr>
        </thead>

        <tbody>
          {dealsData.map((deal) => (
            <tr key={deal.id} className="border-t">
              <td className="px-6 py-4">{deal.dealName}</td>
              <td className="px-6 py-4">{deal.company}</td>
              <td className="px-6 py-4">{deal.stage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
