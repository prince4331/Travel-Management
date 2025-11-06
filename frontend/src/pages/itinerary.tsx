import { format } from "date-fns";
import { CalendarClock, MapPin } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAppStore } from "../store/useAppStore";

export default function ItineraryPage() {
  const { groups } = useAppStore();
  const itinerary = Object.values(groups).flatMap((group) => group.itinerary.map((item) => ({ group, item })));

  return (
    <AppLayout
      title="Global itinerary"
      description="Review every scheduled activity across trips, including offline-ready checklists."
      actions={null}
    >
      <Card>
        <CardHeader>
          <CardTitle>Upcoming agenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {itinerary.length === 0 && <p className="text-sm text-slate-600">No activities scheduled.</p>}
          {itinerary
            .sort((a, b) => new Date(a.item.startsAt).getTime() - new Date(b.item.startsAt).getTime())
            .map(({ group, item }) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{group.title}</p>
                  </div>
                  <CalendarClock className="h-5 w-5 text-primary-600" />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {format(new Date(item.startsAt), "PPpp")} - {format(new Date(item.endsAt), "PPpp")}
                </p>
                {item.location && (
                  <p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" /> {item.location}
                  </p>
                )}
                {item.description && <p className="mt-2 text-xs text-slate-500">{item.description}</p>}
              </div>
            ))}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
