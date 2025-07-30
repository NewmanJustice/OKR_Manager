import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import OKRReviewPage from "../page";

// Mock fetch for objectives
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
              keyResults: [
                {
                  id: 1,
                  title: "Increase MRR",
                  metric: "MRR",
                  targetValue: "$100k",
                  createdAt: "2025-08-01T00:00:00.000Z",
                  successCriteria: [
                    { id: 101, description: "MRR > $90k", threshold: "$90k" },
                    { id: 102, description: "MRR > $80k", threshold: "$80k" },
                  ],
                },
                {
                  id: 2,
                  title: "Reduce churn",
                  metric: "Churn %",
                  targetValue: "<5%",
                  // No createdAt, should fallback to obj.createdAt
                  successCriteria: [],
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

describe("OKRReviewPage", () => {
  it("renders objectives, key results, and success criteria", async () => {
    render(<OKRReviewPage />);
    expect(screen.getByText(/Review your OKRs/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Objective 1: Grow revenue/)).toBeInTheDocument();
      expect(screen.getByText(/KR 1: Increase MRR/)).toBeInTheDocument();
      expect(screen.getByText(/MRR > $90k/)).toBeInTheDocument();
      expect(screen.getByText(/MRR > $80k/)).toBeInTheDocument();
      expect(screen.getByText(/KR 2: Reduce churn/)).toBeInTheDocument();
      expect(screen.getByText(/No success criteria./)).toBeInTheDocument();
    });
  });

  it("shows 'No objectives found.' if objectives are empty", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve({ objectives: [] }) })
    );
    render(<OKRReviewPage />);
    await waitFor(() => {
      expect(screen.getByText(/No objectives found./)).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    render(<OKRReviewPage />);
    expect(screen.getByText(/Loading.../)).toBeInTheDocument();
  });

  it("renders only correct months for each KR", async () => {
    render(<OKRReviewPage />);
    await waitFor(() => expect(screen.getByText(/KR 1: Increase MRR/)).toBeInTheDocument());
    // Should show Aug 2025 to Dec 2025 for KR 1
    expect(screen.getByText("Aug 2025")).toBeInTheDocument();
    expect(screen.getByText("Dec 2025")).toBeInTheDocument();
    expect(screen.queryByText("Jul 2025")).not.toBeInTheDocument();
    // Should show Jun 2025 to Dec 2025 for KR 2 (fallback to obj.createdAt)
    expect(screen.getByText("Jun 2025")).toBeInTheDocument();
    expect(screen.getByText("Dec 2025")).toBeInTheDocument();
  });
});
