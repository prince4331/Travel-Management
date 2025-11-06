import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { useAppStore } from "../store/useAppStore";
import { Badge } from "../components/ui/badge";

export default function OfflinePage() {
  const { syncQueue } = useAppStore();
  const { isSyncing, pendingJobs } = useOfflineSync();

  return (
    <AppLayout
      title="Offline sync"
      description="Manage queued operations, review sync history, and trigger manual retries."
      actions={<Badge variant={pendingJobs > 0 ? "warning" : "success"}>{pendingJobs} pending</Badge>}
    >
      <Card>
        <CardHeader>
          <CardTitle>Sync queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            {isSyncing
              ? "Attempting to sync with the API. Keep this tab open or connect to the internet to accelerate."
              : pendingJobs > 0
              ? "You have pending operations. They'll sync automatically once connectivity is restored."
              : "All operations have been synced."}
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Entity</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Last tried</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syncQueue.map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-3 text-slate-600">{job.entity}</td>
                    <td className="px-4 py-3 text-slate-600">{job.type}</td>
                    <td className="px-4 py-3 text-slate-600">{job.status}</td>
                    <td className="px-4 py-3 text-slate-500">{job.createdAt}</td>
                    <td className="px-4 py-3 text-slate-500">{job.lastTriedAt ?? "-"}</td>
                  </tr>
                ))}
                {syncQueue.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-slate-500">
                      Queue is empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
