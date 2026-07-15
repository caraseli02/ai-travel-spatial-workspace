import type { WorkspaceFeedback } from "./WorkspaceActionFeedback";

export function buildOrganizedInboxItemFeedback({
  source,
  cardTitle,
  day,
}: {
  source: string;
  cardTitle: string;
  day?: number;
}): WorkspaceFeedback {
  return {
    tone: "success",
    title: "Placed on canvas",
    message: `${source} became "${cardTitle}"${day ? ` on Day ${day}` : ""}.`,
  };
}

export function buildInboxCaptureFeedback({
  label,
}: {
  label: string;
}): WorkspaceFeedback {
  return {
    tone: "success",
    title: "Saved to Inbox",
    message: `"${label}" is in your Inbox. Open it anytime to continue your research.`,
  };
}

export function buildAiPlannerInboxDraftFeedback({
  draftLabel,
}: {
  draftLabel: string;
}): WorkspaceFeedback {
  return {
    tone: "success",
    title: "AI draft saved to Inbox",
    message: `Review "${draftLabel}" in the Inbox before placing it on the Spatial Canvas.`,
  };
}

export function buildAiCanvasReplyFeedback({
  cardTitle,
}: {
  cardTitle: string;
}): WorkspaceFeedback {
  return {
    tone: "success",
    title: "AI reply added",
    message: `Opened "${cardTitle}" on the Spatial Canvas.`,
  };
}

export function buildShareFeedback(
  result: "native-shared" | "clipboard-copied" | "copy-failed",
  url?: string,
): WorkspaceFeedback {
  if (result === "copy-failed") {
    return {
      tone: "error",
      title: "Could not copy link automatically",
      message: "Select the link below or use the copy button.",
      copyUrl: url,
    };
  }

  return {
    tone: "success",
    title: result === "native-shared" ? "Share sheet opened" : "Trip link copied",
    message:
      result === "native-shared"
        ? "Use your device share options to send this Trip Workspace."
        : "The Trip Workspace link is ready to paste.",
  };
}

export function buildExportFeedback(
  result: "download-started" | "download-failed",
  filename: string,
): WorkspaceFeedback {
  if (result === "download-failed") {
    return {
      tone: "error",
      title: "Could not export trip",
      message: `Download for ${filename} did not start. Try again from the Export action.`,
    };
  }

  return {
    tone: "success",
    title: "Trip export started",
    message: `Started download for ${filename}.`,
  };
}
