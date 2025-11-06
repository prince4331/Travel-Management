import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

const DEMO_FLAG = process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA === "true";

export function useSeedDemoData() {
  const { groups, addGroup } = useAppStore();

  useEffect(() => {
    if (!DEMO_FLAG) return;
    if (Object.keys(groups).length > 0) return;
    if (typeof window !== "undefined") {
      const hasTokens = window.localStorage.getItem("travel-management.tokens");
      if (hasTokens) return;
    }
    const now = new Date();
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    addGroup({
      id: "demo",
      title: "Alpine Rescue Readiness",
      description: "Training expedition covering glacier rescue protocols and mesh comms drills.",
      destination: "Zermatt, Switzerland",
      startDate: now.toISOString(),
      endDate: future.toISOString(),
      isPublic: false,
      inviteCode: "ALPINE",
      admins: [1],
      members: [
        {
          id: 1,
          email: "captain@travel.app",
          phone: "+41791234567",
          role: { id: 1, name: "admin" },
          createdAt: now.toISOString(),
          bloodGroup: "O+",
          emergencyContact: "Ops HQ +41790000000",
          status: "active",
        },
        {
          id: 2,
          email: "medic@travel.app",
          phone: "+41797654321",
          role: { id: 2, name: "member" },
          createdAt: now.toISOString(),
          bloodGroup: "A-",
          emergencyContact: "Clinic +41795553333",
          status: "active",
        },
      ],
      expenses: [
        {
          id: "exp-1",
          groupId: "demo",
          title: "Avalanche beacons",
          category: "gear",
          currency: "USD",
          amount: 1200,
          splits: [
            { memberId: 1, amount: 600 },
            { memberId: 2, amount: 600 },
          ],
          paidBy: 1,
          incurredOn: now.toISOString(),
          createdAt: now.toISOString(),
        },
      ],
      financeSummary: {
        totalExpenses: 1200,
        totalMembers: 2,
        outstandingBalance: 0,
      },
      documents: [
        {
          id: "doc-1",
          ownerType: "group",
          ownerId: "demo",
          groupId: "demo",
          title: "Insurance Certificate",
          description: "Coverage for alpine operations",
          fileType: "pdf",
          fileSize: 102400,
          storageKey: "documents/demo/insurance.pdf",
          createdAt: now.toISOString(),
          createdBy: 1,
          isEncrypted: true,
        },
      ],
      itinerary: [
        {
          id: "it-1",
          groupId: "demo",
          title: "Crevasse rescue drills",
          description: "Field exercise with beacon relay",
          location: "Gorner Glacier",
          startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          endsAt: new Date(Date.now() + 1000 * 60 * 60 * 27).toISOString(),
          tags: ["safety", "training"],
        },
      ],
      offlinePackages: [
        {
          id: "alps",
          name: "Swiss Alps terrain",
          region: "Europe",
          sizeMB: 512,
          status: "downloaded",
          updatedAt: now.toISOString(),
        },
      ],
      emergencyContacts: [
        {
          id: "ec-1",
          name: "Swiss Rescue",
          phone: "+41799553322",
        },
      ],
      invites: [
        {
          id: "invite-1",
          code: "ALPINE",
          createdAt: now.toISOString(),
          createdBy: 1,
          usedCount: 3,
        },
      ],
    });
  }, [addGroup, groups]);
}
