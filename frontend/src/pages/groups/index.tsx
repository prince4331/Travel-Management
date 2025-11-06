import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useAppStore } from "../../store/useAppStore";
import { useGroupsQuery } from "../../hooks/useGroupsApi";
import { GroupSummary } from "../../types";
import { cn } from "../../utils/cn";

const filterTabs = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "in-progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "public", label: "Public" },
  { id: "private", label: "Private" },
];

function resolveStatus(group: GroupSummary) {
  const now = new Date();
  const start = new Date(group.startDate);
  const end = new Date(group.endDate);
  if (end < now) return "completed";
  if (start > now) return "upcoming";
  return "in-progress";
}

export default function GroupsPage() {
  const groups = useAppStore((state) => state.groups);
  const { isLoading } = useGroupsQuery();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  console.log('=== GROUPS PAGE ===');
  console.log('All groups in store:', Object.values(groups));
  console.log('Groups object:', groups);

  const filteredGroups = useMemo(() => {
    const list = Object.values(groups);
    return list.filter((group) => {
      const matchesSearch = group.title.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (activeTab === "all") return true;
      if (activeTab === "public") return group.isPublic;
      if (activeTab === "private") return !group.isPublic;
      return resolveStatus(group) === activeTab;
    });
  }, [activeTab, groups, search]);

  return (
    <AppLayout
      title="Groups & expeditions"
      description="Create private or public trips, assign admins, and keep every traveler informed."
      actions={
        <>
          <Button variant="secondary" asChild>
            <Link href="/groups/create">New trip</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/offline">Offline kits</Link>
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition shadow-md",
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105" 
                  : "bg-white/70 backdrop-blur-sm text-slate-600 hover:bg-white hover:scale-105",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by destination, invite code, or admin"
            className="w-full rounded-lg border border-white/50 bg-white/70 backdrop-blur-sm px-4 py-2 text-sm text-slate-700 shadow-md focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 md:w-80"
          />
          <div className="flex gap-2 text-xs text-slate-500">
            <Badge variant="info">Offline ready</Badge>
            <span>{Object.values(groups).length} total groups</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && Object.keys(groups).length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent>
              <p className="text-sm text-slate-600">Loading groups...</p>
            </CardContent>
          </Card>
        )}
        {!isLoading && filteredGroups.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                No groups match your filters. Create a new itinerary or adjust the search to find existing trips.
              </p>
              <Button variant="secondary" asChild>
                <Link href="/groups/create">Launch your first trip</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {filteredGroups.map((group) => {
          const status = resolveStatus(group);
          const gradients = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-orange-500 to-red-500',
            'from-green-500 to-teal-500',
            'from-indigo-500 to-blue-500',
            'from-pink-500 to-rose-500'
          ];
          const gradient = gradients[parseInt(group.id.toString()) % gradients.length];
          
          return (
            <Card key={group.id} className="border-0 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] overflow-hidden bg-white/80 backdrop-blur-sm">
              <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl shadow-lg`}>
                      {status === "completed" ? "✓" : status === "upcoming" ? "📅" : "✈️"}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{group.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        📍 {group.destination}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status === "completed" ? "default" : status === "upcoming" ? "info" : "success"}>
                    {status.replace("-", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{group.description ?? "No description provided"}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <span className="font-medium">🔑</span> {group.inviteCode}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <span className="font-medium">{group.isPublic ? "🌍" : "🔒"}</span>
                    {group.isPublic ? "Public" : "Private"}
                  </div>
                  <div className="col-span-2 text-slate-500 text-xs">
                    📆 {format(new Date(group.startDate), "PP")} - {format(new Date(group.endDate), "PP")}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <span className="font-medium">👥</span> {group.members.length} travelers
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 font-semibold">
                    <span className="font-medium">💰</span> ${group.financeSummary.totalExpenses.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-end pt-2">
                  <Button variant="secondary" size="sm" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg">
                    <Link href={`/groups/${group.id}`}>Open Trip →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
