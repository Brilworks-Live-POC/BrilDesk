type Feature = {
  name: string;
  brildesk: string | boolean;
  competitor: string | boolean;
  highlight?: boolean;
};

type ComparisonTableProps = {
  competitorName: string;
  features: Feature[];
};

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="text-green-600 font-medium">Yes</span>
    ) : (
      <span className="text-gray-400">No</span>
    );
  }
  return <span>{value}</span>;
}

export function ComparisonTable({ competitorName, features }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="py-3 pr-4 font-semibold text-gray-900 w-1/3">Feature</th>
            <th className="py-3 px-4 font-semibold text-green-700 w-1/3">BrilDesk</th>
            <th className="py-3 pl-4 font-semibold text-gray-600 w-1/3">{competitorName}</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr
              key={feature.name}
              className={`border-b border-gray-100 ${feature.highlight ? 'bg-green-50' : ''}`}
            >
              <td className="py-3 pr-4 text-gray-700">{feature.name}</td>
              <td className="py-3 px-4">
                <CellValue value={feature.brildesk} />
              </td>
              <td className="py-3 pl-4">
                <CellValue value={feature.competitor} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type PricingComparisonProps = {
  competitorName: string;
  brildeskPrice: string;
  competitorPrice: string;
  brildeskIncludes: string[];
  competitorIncludes: string[];
  brildeskNote?: string;
  competitorNote?: string;
};

export function PricingComparison({
  competitorName,
  brildeskPrice,
  competitorPrice,
  brildeskIncludes,
  competitorIncludes,
  brildeskNote,
  competitorNote,
}: PricingComparisonProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border-2 border-green-600 bg-green-50 p-6">
        <h3 className="mb-1 text-lg font-bold text-green-700">BrilDesk</h3>
        <p className="mb-4 text-3xl font-bold text-gray-900">{brildeskPrice}</p>
        {brildeskNote && <p className="mb-4 text-sm text-gray-600">{brildeskNote}</p>}
        <ul className="space-y-2">
          {brildeskIncludes.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-0.5 text-green-600">&#10003;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-1 text-lg font-bold text-gray-600">{competitorName}</h3>
        <p className="mb-4 text-3xl font-bold text-gray-900">{competitorPrice}</p>
        {competitorNote && <p className="mb-4 text-sm text-gray-600">{competitorNote}</p>}
        <ul className="space-y-2">
          {competitorIncludes.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-0.5 text-gray-400">&#10003;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CtaBanner() {
  return (
    <section className="rounded-2xl bg-green-600 px-8 py-12 text-center text-white">
      <h2 className="mb-3 text-2xl font-bold md:text-3xl">
        Ready to close more deals on WhatsApp?
      </h2>
      <p className="mx-auto mb-6 max-w-xl text-green-100">
        BrilDesk gives your sales team a shared WhatsApp inbox with built-in CRM, deal tracking,
        and smart agent routing — at a price that works for growing teams.
      </p>
      <a
        href="/beta"
        className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-green-700 hover:bg-green-50"
      >
        Start Free Trial
      </a>
    </section>
  );
}
