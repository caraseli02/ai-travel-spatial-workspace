/** Kanban (embedded) cards: compact below md, full size at md+. */
export function kanbanContentPad(embedded?: boolean, desktop = "p-3.5") {
  if (!embedded) return desktop;
  return desktop === "p-4" ? "p-2.5 md:p-4" : "p-2.5 md:p-3.5";
}

export function kanbanImageHeight(
  embedded: boolean | undefined,
  embeddedClasses: string,
  desktopClasses: string,
) {
  return embedded ? embeddedClasses : desktopClasses;
}
