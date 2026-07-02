import { TripMapView, WorkspaceViewSwitcher, type WorkspaceView } from "@/components/TripWorkspaceViews";
import { createDemoTrip } from "@/data/tripData";
import type { CanvasCard } from "@/models/trip";
import { kanbanColumns } from "./landingPreviewData";
import { KanbanColumn } from "./KanbanColumn";
import { PreviewAiPromptBar } from "./PreviewAiPromptBar";

export function MobileWorkspacePreview({
  view,
  onViewChange,
  selectedCard,
  onSelectCard,
  demoTrip,
}: {
  view: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  selectedCard: CanvasCard | null;
  onSelectCard: (card: CanvasCard) => void;
  demoTrip: ReturnType<typeof createDemoTrip>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f5f3ef] p-3 md:hidden">
      <div className="mb-2 flex justify-center">
        <WorkspaceViewSwitcher value={view} onValueChange={onViewChange} />
      </div>

      {view === "canvas" ? (
        <>
          <div className="mb-2 flex items-center justify-between gap-2 px-1 text-[11px]">
            <span className="font-medium text-stone-500">Swipe for more days →</span>
            <span className="font-semibold text-stone-600">Day 1 of 4</span>
          </div>

          <div className="relative min-h-0 flex-1">
            <div className="h-full overflow-x-auto overflow-y-hidden pb-2">
              <div className="flex h-full min-w-max gap-2.5">
                {kanbanColumns.map((column, index) => (
                  <KanbanColumn
                    key={column.label}
                    {...column}
                    showAddCard={index === kanbanColumns.length - 1}
                    className="w-[300px]"
                  />
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f5f3ef] to-transparent" />
          </div>

          <PreviewAiPromptBar className="mt-2" />
        </>
      ) : (
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-[#e7e3dc]">
          <TripMapView
            days={demoTrip.days}
            cards={demoTrip.cards}
            activeDay={null}
            selectedCard={selectedCard}
            onSelectCard={onSelectCard}
            showRoutePanel={false}
            interactive={false}
          />
        </div>
      )}
    </div>
  );
}
