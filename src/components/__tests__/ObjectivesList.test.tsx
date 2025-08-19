import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import ObjectivesList from "../ObjectivesList";
import Link from "next/link";

const mockObjectives = [
  { guid: "abc-123", title: "Objective 1", dueDate: "2025-08-01" },
  { guid: "def-456", title: "Objective 2", dueDate: "2025-09-01" }
];

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({ objectives: mockObjectives })
  })
);

describe("ObjectivesList", () => {
  it("renders objectives and view buttons with correct links", async () => {
    render(<ObjectivesList userId={1} />);
    await waitFor(() => {
      expect(screen.getByText("Your Objectives")).toBeInTheDocument();
      expect(screen.getByText("Objective 1")).toBeInTheDocument();
      expect(screen.getByText("Objective 2")).toBeInTheDocument();
      // Check for view buttons
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      expect(viewButtons.length).toBe(2);
      expect(viewButtons[0].closest('a')).toHaveAttribute('href', '/objectives/abc-123');
      expect(viewButtons[1].closest('a')).toHaveAttribute('href', '/objectives/def-456');
    });
  });

  it("renders objectives with black title", async () => {
    render(<ObjectivesList userId={1} />);
    await waitFor(() => {
      const title = screen.getByText("Objective 1");
      expect(title).toBeInTheDocument();
      expect(title).toHaveStyle({ color: 'black' });
    });
  });

  it("shows message and link when no objectives", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ objectives: [] })
      })
    );
    render(<ObjectivesList userId={1} />);
    await waitFor(() => {
      expect(screen.getByText("You have no objectives yet.")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create objective/i })).toBeInTheDocument();
    });
  });

  it("does not render if no userId", () => {
    render(<ObjectivesList userId={undefined} />);
    expect(screen.queryByText("Your Objectives")).not.toBeInTheDocument();
  });
});
