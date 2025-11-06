import dynamic from "next/dynamic";
import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const sampleGuide = `# Safety briefing

## Health
- Carry medical kit (offline list preloaded)
- Verify blood group records for all travelers

## Communications
- Mesh relays activated for canyon segment
- SMS fallback enabled for Admin + Co-Admin

## Weather
- Cached forecasts show sub-zero nights. Pack layered gear.`;

const WorldMap = dynamic(() => import("../sections/WorldMap"), { ssr: false, loading: () => <p>Loading map...</p> });

export default function GuidesPage() {
  return (
    <AppLayout
      title="Travel guides"
      description="Deliver contextual intel packs, safety briefings, and offline storytelling to every traveler."
      actions={null}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Global briefings</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{sampleGuide}</ReactMarkdown>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Interactive map</CardTitle>
          </CardHeader>
          <CardContent>
            <WorldMap />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
