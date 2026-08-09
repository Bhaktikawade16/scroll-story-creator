import { createFileRoute } from "@tanstack/react-router";
import { ScrollFrames } from "@/components/ScrollFrames";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scroll Frame Sequence — Ambient Light" },
      {
        name: "description",
        content:
          "A scroll-driven frame-by-frame animation of ambient light sweeping across a room.",
      },
      { property: "og:title", content: "Scroll Frame Sequence — Ambient Light" },
      {
        property: "og:description",
        content:
          "A scroll-driven frame-by-frame animation of ambient light sweeping across a room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-background">
      <ScrollFrames />
    </main>
  );
}
