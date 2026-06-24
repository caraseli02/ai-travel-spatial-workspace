import type { Trip } from "@/models/trip";
import { generateTripFromMessage } from "@/utils/tripListHelpers";

export interface TripListPromptResult {
  trip: Trip;
  aiResponse: string;
}

export function buildTripListPromptResult(prompt: string): TripListPromptResult {
  const trip = generateTripFromMessage(prompt);
  const destinationName = trip.destination.split(",")[0];
  const aiResponse =
    `I've created a trip to **${destinationName}** for you!\n\n` +
    `**Dates:** ${trip.dates ? `${trip.dates.start} to ${trip.dates.end}` : "Flexible"}\n` +
    `**Travelers:** ${trip.travelers}\n` +
    `**Budget:** ${trip.budget}\n` +
    `**Activities:** ${trip.activities?.join(", ") || "Exploring sights"}\n\n` +
    "Your trip has been added to your list! Click **View Details** to open the workspace.";

  return { trip, aiResponse };
}
