import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OKRReviewPage from "../page";

describe("OKRReviewPage - Quarterly Review Modal", () => {
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
                  { id: 1, quarter: 3, year: 2025, grading: 0.8, lessonsLearned: 'LL', strategicAdjustment: 'SA', nextQuarterPlanning: 'NQP', engagement: 'E', actionCompletion: 'AC', strategicAlignment: 'SAL', feedbackQuality: 'FQ' },
                ],
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

  it("opens quarterly modal, displays review fields, and allows editing", async () => {
    render(<OKRReviewPage />);
    await waitFor(() => expect(screen.getByText(/Q3 2025/)).toBeInTheDocument());
    // Open modal
    fireEvent.click(screen.getByText("Q3 2025"));
    expect(screen.getByText(/Quarterly Review/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("0.8")).toBeInTheDocument();
    expect(screen.getByDisplayValue("LL")).toBeInTheDocument();
    expect(screen.getByDisplayValue("SA")).toBeInTheDocument();
    expect(screen.getByDisplayValue("NQP")).toBeInTheDocument();
    expect(screen.getByDisplayValue("E")).toBeInTheDocument();
    expect(screen.getByDisplayValue("AC")).toBeInTheDocument();
    expect(screen.getByDisplayValue("SAL")).toBeInTheDocument();
    expect(screen.getByDisplayValue("FQ")).toBeInTheDocument();
    // Change grading
    fireEvent.change(screen.getByLabelText(/Lessons Learned/), { target: { value: "Updated LL" } });
    // Save
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    await waitFor(() => expect(screen.queryByText(/Quarterly Review/)).not.toBeInTheDocument());
  });
});
