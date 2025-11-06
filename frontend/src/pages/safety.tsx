import { ShieldCheck, Siren, Smartphone } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function SafetyPage() {
  return (
    <AppLayout
      title="Safety hub"
      description="Centralize emergency protocols, SOS automation, and mesh fallback messaging."
      actions={null}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Emergency matrix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <ShieldCheck className="h-5 w-5 text-primary-600" />
            <p>Assign escalation tiers per trip with embassy, hospital, and local liaison contacts.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SOS automation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <Siren className="h-5 w-5 text-primary-600" />
            <p>SMS fallback broadcasts location and medical details when mesh connectivity fails.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Biometric access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <Smartphone className="h-5 w-5 text-primary-600" />
            <p>Enable fingerprint or FaceID login on mobile for rapid emergency access.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
