import type { KanbanPreviewColumn } from "./landingPreviewData";

export function getFeatureKanbanColumns(columns: KanbanPreviewColumn[]): KanbanPreviewColumn[] {
  return columns.slice(1, 3);
}
