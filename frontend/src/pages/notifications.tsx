import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAppStore } from "../store/useAppStore";
import { Badge } from "../components/ui/badge";

export default function NotificationsPage() {
  const { notifications } = useAppStore();

  return (
    <AppLayout
      title="Notification center"
      description="Configure push, SMS, and email alerts with quiet hours for sensitive destinations."
      actions={<Badge variant="info">FCM + SMS fallback</Badge>}
    >
      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          {notifications.map((pref) => (
            <div key={pref.channel} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <span className="font-medium text-slate-700">{pref.channel.toUpperCase()}</span>
              <Badge variant={pref.enabled ? "success" : "default"}>{pref.enabled ? "Enabled" : "Disabled"}</Badge>
            </div>
          ))}
          <p className="text-xs text-slate-500">
            Changes sync to the backend audit log once connectivity is restored.
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
