import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OKRReviewPage from "../page";

// Mock fetch for objectives with reviews
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          objectives: [
            {
              guid: "obj-1",
              title: "Grow revenue",
              dueDate: "2025-12-31T00:00:00.000Z",
              keyResults: [
                {
                  id: 1,
                  title: "Increase MRR",
                  metric: "MRR",
                  targetValue: "$100k",
                  successCriteria: [
                    { id: 101, description: "MRR > $90k", threshold: "$90k" },
                  ],
                  reviews: [
                    { id: 201, month: 7, year: 2025, progress: 80, notes: "Good progress" },
                  ],
                },
              ],
            },
          ],
        }),
    }) as any
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("OKRReviewPage - Review Modal", () => {
  it("opens modal, displays review, and allows editing and saving", async () => {
    render(<OKRReviewPage />);
    await waitFor(() => expect(screen.getByText(/KR 1: Increase MRR/)).toBeInTheDocument());
    // Open modal
    fireEvent.click(screen.getAllByRole("button", { name: "RateReviewIcon" })[0]);
    expect(screen.getByText(/Review Key Result/)).toBeInTheDocument();
    // Progress and notes should be prefilled
    expect(screen.getByDisplayValue("80")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Good progress")).toBeInTheDocument();
    // Change progress and notes
    fireEvent.change(screen.getByLabelText(/Notes/), { target: { value: "Updated notes" } });
    // Save
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    await waitFor(() => expect(screen.queryByText(/Review Key Result/)).not.toBeInTheDocument());
  });

  it("allows deleting a review", async () => {
    render(<OKRReviewPage />);
    await waitFor(() => expect(screen.getByText(/KR 1: Increase MRR/)).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole("button", { name: "RateReviewIcon" })[0]);
    expect(screen.getByText(/Review Key Result/)).toBeInTheDocument();
    // Delete
    fireEvent.click(screen.getByRole("button", { name: /Delete Review/i }));
    await waitFor(() => expect(screen.queryByText(/Review Key Result/)).not.toBeInTheDocument());
  });

  it("shows correct color and icon in modal and on trigger", async () => {
    render(<OKRReviewPage />);
    await waitFor(() => expect(screen.getByText(/KR 1: Increase MRR/)).toBeInTheDocument());
    // Icon should be RateReviewIcon
    expect(screen.getAllByTestId("RateReviewIcon").length).toBeGreaterThan(0);
    // Open modal
    fireEvent.click(screen.getAllByTestId("RateReviewIcon")[0]);
    expect(screen.getByText(/Review Key Result/)).toBeInTheDocument();
    // Save button should have correct color
    const saveBtn = screen.getByRole("button", { name: /Save/i });
    expect(saveBtn).toHaveStyle({ backgroundColor: "#1976d2" });
  });
});
