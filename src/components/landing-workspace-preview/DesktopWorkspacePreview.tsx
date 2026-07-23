import { TripMapView, type WorkspaceView } from "@/components/TripWorkspaceViews";
import { createDemoTrip } from "@/data/tripData";
import type { CanvasCard } from "@/models/trip";
import { kanbanColumns } from "./landingPreviewData";
import { KanbanColumn } from "./KanbanColumn";
import { PreviewWorkspaceChrome } from "./PreviewWorkspaceChrome";

export function DesktopWorkspacePreview({
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
    <div className="relative hidden min-h-0 flex-1 flex-col bg-[#f5f3ef] md:flex">
      <PreviewWorkspaceChrome view={view} onViewChange={onViewChange} stickyBelowNav />

      <div className="flex min-h-0 flex-1 flex-col">
        {view === "canvas" ? (
          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-10 pb-3 pt-2">
            <div className="flex h-full min-w-max items-stretch gap-3">
              {kanbanColumns.map((column, index) => (
                <KanbanColumn
                  key={column.label}
                  {...column}
                  showAddCard={index === kanbanColumns.length - 1}
                  className="h-full min-h-0"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative min-h-0 flex-1 overflow-hidden">
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
    </div>
  );
}
