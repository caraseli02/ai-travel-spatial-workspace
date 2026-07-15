import { getFeatureKanbanColumns } from "./getFeatureKanbanColumns";
import { kanbanColumns } from "./landingPreviewData";
import { KanbanColumn } from "./KanbanColumn";

export function FeatureKanbanPreview() {
  const featureKanbanColumns = getFeatureKanbanColumns(kanbanColumns);

  return (
    <div className="relative h-full bg-[#f5f3ef]">
      <div className="h-full overflow-y-auto overflow-x-hidden p-3 md:p-4 lg:overflow-x-auto lg:overflow-y-hidden">
        <div className="flex flex-col gap-2.5 lg:h-full lg:min-w-max lg:flex-row lg:gap-3">
          {featureKanbanColumns.map((column) => (
            <KanbanColumn
              key={column.label}
              {...column}
              className="w-full shrink-0 lg:w-[255px]"
            />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-10 bg-gradient-to-l from-[#f5f3ef] to-transparent lg:block" />
    </div>
  );
}
