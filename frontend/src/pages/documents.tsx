import { useMemo } from "react";
import { ShieldCheck, Upload } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAppStore } from "../store/useAppStore";
import { Badge } from "../components/ui/badge";
import { useGroupsQuery } from "../hooks/useGroupsApi";

export default function DocumentsPage() {
  const groups = useAppStore((state) => state.groups);
  const { isLoading } = useGroupsQuery();
  const documents = useMemo(
    () => Object.values(groups).flatMap((group) => group.documents.map((doc) => ({ group, doc }))),
    [groups],
  );

  return (
    <AppLayout
      title="Document vault"
      description="Securely store passports, visas, permits, and insurance files with offline availability."
      actions={<Badge variant="info">Zero-trust encryption</Badge>}
    >
      <Card>
        <CardHeader>
          <CardTitle>Stored documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && documents.length === 0 && <p className="text-sm text-slate-600">Loading documents...</p>}
          {!isLoading && documents.length === 0 && <p className="text-sm text-slate-600">No documents uploaded yet.</p>}
          {documents.map(({ group, doc }) => (
            <div key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-800">{doc.title}</p>
                <p className="text-xs text-slate-500">
                  {group.title} | {doc.fileType} | {(doc.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs text-slate-500">Encrypted at rest</span>
              </div>
            </div>
          ))}
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-700">Upload guidance</p>
            <p className="mt-2">
              Use the trip workspace to upload files. They will sync here automatically once processed by the backend and
              cached for offline access.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
              <Upload className="h-4 w-4" />
              Drag & drop coming soon
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
