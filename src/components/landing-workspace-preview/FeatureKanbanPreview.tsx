import { getFeatureKanbanColumns } from "./getFeatureKanbanColumns";
import { kanbanColumns } from "./landingPreviewData";
import { KanbanColumn } from "./KanbanColumn";

export function FeatureKanbanPreview() {
  const featureKanbanColumns = getFeatureKanbanColumns(kanbanColumns);

  return (
    <div className="relative h-full bg-[#f5f3ef]">
      <div className="h-full overflow-x-auto overflow-y-hidden p-3 md:p-4">
        <div className="flex h-full min-w-max gap-2.5 md:gap-3">
          {featureKanbanColumns.map((column) => (
            <KanbanColumn
              key={column.label}
              {...column}
              className="w-[240px] md:w-[255px]"
            />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f5f3ef] to-transparent" />
    </div>
  );
}
