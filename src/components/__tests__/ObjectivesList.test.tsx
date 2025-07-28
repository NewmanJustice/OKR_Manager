import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import ObjectivesList from "../ObjectivesList";

const mockObjectives = [
  { id: 1, title: "Objective 1", dueDate: "2025-08-01" },
  { id: 2, title: "Objective 2", dueDate: "2025-09-01" }
];

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({ objectives: mockObjectives })
  })
);

describe("ObjectivesList", () => {
  it("renders objectives when present", async () => {
    render(<ObjectivesList userEmail="user@example.com" />);
    await waitFor(() => {
      expect(screen.getByText("Your Objectives")).toBeInTheDocument();
      expect(screen.getByText("Objective 1")).toBeInTheDocument();
      expect(screen.getByText("Objective 2")).toBeInTheDocument();
    });
  });

  it("renders objectives with black title", async () => {
    render(<ObjectivesList userEmail="user@example.com" />);
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
    render(<ObjectivesList userEmail="user@example.com" />);
    await waitFor(() => {
      expect(screen.getByText("You have no objectives yet.")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create objective/i })).toBeInTheDocument();
    });
  });

  it("does not render if no userEmail", () => {
    render(<ObjectivesList userEmail={undefined} />);
    expect(screen.queryByText("Your Objectives")).not.toBeInTheDocument();
  });
});
