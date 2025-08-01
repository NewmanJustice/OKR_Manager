import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import OKRReviewPage from "../page";

describe("OKRReviewPage - Quarterly Review Range Logic", () => {
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
                createdAt: "2025-06-01T00:00:00.000Z",
                quarterlyReviews: [
                  { id: 1, quarter: 3, year: 2025, grading: 0.8, lessonsLearned: '', strategicAdjustment: '', nextQuarterPlanning: '', engagement: '', actionCompletion: '', strategicAlignment: '', feedbackQuality: '' },
                ],
                keyResults: [],
              },
              {
                guid: "obj-2",
                title: "Expand market",
                dueDate: "2026-03-31T00:00:00.000Z",
                createdAt: "2025-11-15T00:00:00.000Z",
                quarterlyReviews: [],
                keyResults: [],
              },
            ],
          }),
      }) as any
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("shows only quarters between createdAt and dueDate (inclusive) with correct year/quarter labels", async () => {
    render(<OKRReviewPage />);
    await waitFor(() => expect(screen.getByText(/Objective 1: Grow revenue/)).toBeInTheDocument());
    // For obj-1: createdAt Jun 2025, dueDate Dec 2025 => Q2, Q3, Q4 2025
    expect(screen.getByText("Q2 2025")).toBeInTheDocument();
    expect(screen.getByText("Q3 2025")).toBeInTheDocument();
    expect(screen.getByText("Q4 2025")).toBeInTheDocument();
    expect(screen.queryByText("Q1 2025")).not.toBeInTheDocument();
    expect(screen.queryByText("Q1 2026")).not.toBeInTheDocument();
    // For obj-2: createdAt Nov 2025, dueDate Mar 2026 => Q4 2025, Q1 2026
    expect(screen.getByText("Q4 2025")).toBeInTheDocument();
    expect(screen.getByText("Q1 2026")).toBeInTheDocument();
    expect(screen.queryByText("Q3 2025")).not.toBeInTheDocument();
    expect(screen.queryByText("Q2 2026")).not.toBeInTheDocument();
  });
});
