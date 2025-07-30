import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OKRReviewPage from "../page";

describe("OKRReviewPage - Month/Year Range Logic", () => {
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
                    successCriteria: [],
                    reviews: [],
                  },
                  {
                    id: 2,
                    title: "Reduce churn",
                    metric: "Churn %",
                    targetValue: "<5%",
                    // No createdAt, should fallback to obj.createdAt
                    successCriteria: [],
                    reviews: [],
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

  it("shows only months between KR createdAt and dueDate (inclusive)", async () => {
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

  it("modal month/year pickers only allow valid range", async () => {
    render(<OKRReviewPage />);
    await waitFor(() => expect(screen.getByText(/KR 1: Increase MRR/)).toBeInTheDocument());
    // Open modal for KR 1
    fireEvent.click(screen.getAllByRole("button", { name: "RateReviewIcon" })[0]);
    await waitFor(() => expect(screen.getByText(/Review Key Result/)).toBeInTheDocument());
    // Only Aug-Dec 2025 should be available
    expect(screen.getByText("August")).toBeInTheDocument();
    expect(screen.getByText("December")).toBeInTheDocument();
    expect(screen.queryByText("July")).not.toBeInTheDocument();
    // Change to KR 2 (simulate by closing and opening modal for KR 2)
    fireEvent.click(screen.getByText("Cancel"));
    fireEvent.click(screen.getAllByRole("button", { name: "RateReviewIcon" })[1]);
    await waitFor(() => expect(screen.getByText(/Review Key Result/)).toBeInTheDocument());
    // Only Jun-Dec 2025 should be available
    expect(screen.getByText("June")).toBeInTheDocument();
    expect(screen.getByText("December")).toBeInTheDocument();
    expect(screen.queryByText("May")).not.toBeInTheDocument();
  });
});
