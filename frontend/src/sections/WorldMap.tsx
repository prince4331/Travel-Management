import { memo } from "react";

const regions = [
  { name: "North America", status: "Operational", color: "bg-emerald-500/70" },
  { name: "South America", status: "Caution", color: "bg-amber-500/70" },
  { name: "Europe", status: "Operational", color: "bg-emerald-500/70" },
  { name: "Africa", status: "Monitoring", color: "bg-sky-500/70" },
  { name: "Asia", status: "Operational", color: "bg-emerald-500/70" },
  { name: "Oceania", status: "Restricted", color: "bg-red-500/70" },
];

function WorldMapComponent() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
        {regions.map((region) => (
          <div key={region.name} className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">{region.name}</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium text-white ${region.color}`}>
              {region.status}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
        <span>Offline guides synced automatically.</span>
        <span>Mesh relay coverage 94%</span>
      </div>
    </div>
  );
}

export default memo(WorldMapComponent);
