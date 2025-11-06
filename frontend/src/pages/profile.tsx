import { useAuth } from "../context/AuthContext";
import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AppLayout
      title="Profile"
      description="Review account metadata synced from the NestJS backend."
      actions={user?.role?.name ? <Badge variant="info">{user.role.name}</Badge> : null}
    >
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Email: {user?.email}</p>
          <p>Phone: {user?.phone}</p>
          <p>Blood group: {user?.bloodGroup ?? "Not provided"}</p>
          <p>Emergency contact: {user?.emergencyContact ?? "Not provided"}</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
