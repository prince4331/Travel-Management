import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/router";
import { AppLayout } from "../../components/layout/AppLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useCreateGroupMutation } from "../../hooks/useGroupsApi";
import { useAppStore } from "../../store/useAppStore";

const createGroupSchema = z.object({
  title: z.string().min(3, "Trip name is required"),
  description: z.string().optional(),
  destination: z.string().min(2, "Destination is required"),
  startDate: z.string(),
  endDate: z.string(),
  isPublic: z.boolean().default(false),
  tourType: z.enum(['friendly', 'paid']).default('friendly'),
  showFinancialDetailsToMembers: z.boolean().default(true),
});

export default function CreateGroupPage() {
  const router = useRouter();
  const createGroupMutation = useCreateGroupMutation();
  const { addGroup } = useAppStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      title: "",
      description: "",
      destination: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      isPublic: false,
      tourType: "friendly" as const,
      showFinancialDetailsToMembers: true,
    },
  });

  const onSubmit = handleSubmit(async (input) => {
    console.log('=== CREATE GROUP SUBMIT ===');
    console.log('Input:', input);
    
    const group = await createGroupMutation.mutateAsync({
      title: input.title,
      description: input.description,
      destination: input.destination,
      startDate: new Date(input.startDate).toISOString(),
      endDate: new Date(input.endDate).toISOString(),
      isPublic: input.isPublic,
      tourType: input.tourType,
      showFinancialDetailsToMembers: input.showFinancialDetailsToMembers,
      members: [],
    });
    
    console.log('✅ Group created:', group);
    console.log('Group ID:', group.id);
    console.log('Group ID type:', typeof group.id);
    
    reset();
    
    console.log('Navigating to:', `/groups/${group.id}`);
    await router.push(`/groups/${group.id}`);
  });

  return (
    <AppLayout
      title="Plan a new expedition"
      description="Define your core itinerary, security posture, and travel brief before inviting members."
      actions={
        <Badge variant="info">Offline-ready templates</Badge>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="title">
                  Trip name
                </label>
                <input
                  id="title"
                  type="text"
                  {...register("title")}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="description">
                  Mission brief
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register("description")}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="Describe the goal, key stops, and any safety notes"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="destination">
                    Destination / hub
                  </label>
                  <input
                    id="destination"
                    type="text"
                    {...register("destination")}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                  {errors.destination && <p className="mt-1 text-xs text-red-600">{errors.destination.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Visibility</label>
                  <select
                    {...register("isPublic", { setValueAs: (value) => value === "true" })}
                    defaultValue="false"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="false">Private (invite only)</option>
                    <option value="true">Public (members request access)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Tour type & financial privacy</label>
                <select
                  {...register("tourType", {
                    onChange: (e) => {
                      const value = e.target.value;
                      const showFinancials = value === 'friendly';
                      // Update the form value for showFinancialDetailsToMembers
                      const form = e.target.form;
                      if (form) {
                        const checkbox = form.querySelector('input[name="showFinancialDetailsToMembers"]') as HTMLInputElement;
                        if (checkbox) {
                          checkbox.checked = showFinancials;
                        }
                      }
                    }
                  })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="friendly">🤝 Friendly tour (everyone sees all expenses)</option>
                  <option value="paid">💼 Paid tour (only admins see expenses)</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  <strong>Friendly:</strong> All members can see who paid what, all balances, and full expense details.<br />
                  <strong>Paid:</strong> Regular members cannot see ANY financial information. Only admins/co-admins can view expenses and balances.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="startDate">
                    Start date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="endDate">
                    End date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Security & logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Emergency protocols</p>
                <p className="mt-2 text-sm text-slate-600">
                  Add emergency contacts, medical notes, and contingency plans after creating the trip.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Offline readiness</p>
                <p className="mt-2 text-sm text-slate-600">
                  Default travel pack includes offline maps, itinerary sync, and contact lists. Customize per destination
                  inside the trip workspace.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Invitations</p>
                <p className="mt-2 text-sm text-slate-600">
                  Share the invite code below or generate QR codes inside the trip workspace. SMS invitations work offline
                  and sync when online.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invite code & tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="tags">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  placeholder="Adventure, trekking, family"
                  onBlur={(event) => {
                    const value = event.target.value.trim();
                    if (!value) return;
                    const parts = value.split(/[,#]/).map((part) => part.trim()).filter(Boolean);
                    event.target.value = parts.join(", ");
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <p className="mt-1 text-xs text-slate-500">Use tags for quick filtering and guide recommendations.</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                After creating the group you can invite admins, add emergency protocols, upload travel docs, and configure
                offline data kits. Everything syncs automatically when you regain connectivity.
              </p>
              <Button type="submit" isLoading={isSubmitting || createGroupMutation.isPending} loadingText="Creating trip...">
                Create trip workspace
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </AppLayout>
  );
}
