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

export function buildShareFeedback(result: "native-shared" | "clipboard-copied" | "copy-failed"): WorkspaceFeedback {
  if (result === "copy-failed") {
    return {
      tone: "error",
      title: "Could not copy link",
      message: "Copy the trip link from the address bar instead.",
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
