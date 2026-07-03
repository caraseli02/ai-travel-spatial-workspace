// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { localTripRepository } from "@/models/tripRepository";
import TripListPage from "./TripListPage";

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("@/models/tripRepository", () => ({
  localTripRepository: {
    list: vi.fn(() => []),
    save: vi.fn(),
    load: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("TripListPage", () => {
  beforeEach(() => {
    navigate.mockReset();
    vi.mocked(localTripRepository.list).mockReturnValue([]);
    vi.mocked(localTripRepository.save).mockClear();
  });

  it("opens the create Trip dialog, validates required fields, and submits a new Trip", async () => {
    const user = userEvent.setup();

    render(<TripListPage />);

    await user.click(screen.getByRole("button", { name: "New trip" }));

    const submitButton = screen.getByRole("button", { name: "Create Trip" });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Trip Name"), "Barcelona Spring");
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Destination"), "Barcelona, Spain");
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    expect(localTripRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Barcelona Spring",
        destination: "Barcelona, Spain",
        emoji: "✈️",
      }),
    );
    expect(navigate).toHaveBeenCalledWith(expect.stringMatching(/^\/trips\/trip_/));
  });
});
