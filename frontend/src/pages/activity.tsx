import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAppStore } from "../store/useAppStore";

export default function ActivityPage() {
  const { syncQueue } = useAppStore();

  return (
    <AppLayout
      title="Audit trail"
      description="All critical actions are logged locally and replayed to the backend audit log when online."
      actions={null}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          {syncQueue.slice(-10).reverse().map((job) => (
            <div key={job.id} className="rounded-xl border border-slate-200 px-4 py-3">
              <p className="font-medium text-slate-700">
                {job.type} {job.entity}
              </p>
              <p className="text-xs text-slate-500">{job.createdAt}</p>
            </div>
          ))}
          {syncQueue.length === 0 && <p>No operations yet.</p>}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
