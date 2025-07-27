import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import CreateObjectiveWizard from "../CreateObjectiveWizard";

// Mock next/navigation useRouter
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe("CreateObjectiveWizard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the stepper and first step fields", () => {
    render(<CreateObjectiveWizard />);
    expect(screen.getByText("Objective Details")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Due Date")).toBeInTheDocument();
  });

  it("validates required objective fields", () => {
    render(<CreateObjectiveWizard />);
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(/please fill in the objective title and due date/i)).toBeInTheDocument();
  });

  it("can add and remove key results", () => {
    render(<CreateObjectiveWizard />);
    // Go to Key Results step
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "My Objective" } });
    fireEvent.change(screen.getByLabelText("Due Date"), { target: { value: "2025-12-31" } });
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Add Key Results")).toBeInTheDocument();
    // Add a key result
    fireEvent.click(screen.getAllByRole('button', { name: /add/i })[0]);
    expect(screen.getAllByLabelText("Title").length).toBeGreaterThan(1);
    // Remove a key result
    fireEvent.click(screen.getAllByRole('button', { name: /remove/i })[0]);
    expect(screen.getAllByLabelText("Title").length).toBeGreaterThan(0);
  });

  it("validates key result fields", () => {
    render(<CreateObjectiveWizard />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "My Objective" } });
    fireEvent.change(screen.getByLabelText("Due Date"), { target: { value: "2025-12-31" } });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(/each key result must have a title, metric, target value/i)).toBeInTheDocument();
  });

  it("can add and remove success criteria", () => {
    render(<CreateObjectiveWizard />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "My Objective" } });
    fireEvent.change(screen.getByLabelText("Due Date"), { target: { value: "2025-12-31" } });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.change(screen.getAllByLabelText("Title")[1], { target: { value: "KR 1" } });
    fireEvent.change(screen.getByLabelText("Metric"), { target: { value: "%" } });
    fireEvent.change(screen.getByLabelText("Target Value"), { target: { value: "100" } });
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Add Success Criteria for Each Key Result")).toBeInTheDocument();
    // Add a success criteria
    fireEvent.click(screen.getAllByRole('button', { name: /add/i })[0]);
    expect(screen.getAllByLabelText("Description").length).toBeGreaterThan(1);
    // Remove a success criteria
    fireEvent.click(screen.getAllByRole('button', { name: /remove/i })[0]);
    expect(screen.getAllByLabelText("Description").length).toBeGreaterThan(0);
  });

  it("validates success criteria fields", () => {
    render(<CreateObjectiveWizard />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "My Objective" } });
    fireEvent.change(screen.getByLabelText("Due Date"), { target: { value: "2025-12-31" } });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.change(screen.getAllByLabelText("Title")[1], { target: { value: "KR 1" } });
    fireEvent.change(screen.getByLabelText("Metric"), { target: { value: "%" } });
    fireEvent.change(screen.getByLabelText("Target Value"), { target: { value: "100" } });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(/each success criteria must have a description and threshold/i)).toBeInTheDocument();
  });

  it("shows cancel confirmation dialog and cancels", async () => {
    render(<CreateObjectiveWizard />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText(/cancel objective creation/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/yes, cancel/i));
    // Should redirect to dashboard (mocked)
    await waitFor(() => expect(screen.queryByText(/cancel objective creation/i)).not.toBeInTheDocument());
  });

  it("submits valid objective and redirects", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) }) as any;
    const { getByText, getByLabelText, getAllByLabelText } = render(<CreateObjectiveWizard />);
    fireEvent.change(getByLabelText("Title"), { target: { value: "My Objective" } });
    fireEvent.change(getByLabelText("Due Date"), { target: { value: "2025-12-31" } });
    fireEvent.click(getByText("Next"));
    fireEvent.change(getAllByLabelText("Title")[1], { target: { value: "KR 1" } });
    fireEvent.change(getByLabelText("Metric"), { target: { value: "%" } });
    fireEvent.change(getByLabelText("Target Value"), { target: { value: "100" } });
    fireEvent.click(getByText("Next"));
    fireEvent.change(getByLabelText("Description"), { target: { value: "SC 1" } });
    fireEvent.change(getByLabelText("Threshold"), { target: { value: "90" } });
    fireEvent.click(getByText("Next"));
    fireEvent.click(getByText("Submit"));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it("shows error on failed submit", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Failed!" }) }) as any;
    const { getByText, getByLabelText, getAllByLabelText } = render(<CreateObjectiveWizard />);
    fireEvent.change(getByLabelText("Title"), { target: { value: "My Objective" } });
    fireEvent.change(getByLabelText("Due Date"), { target: { value: "2025-12-31" } });
    fireEvent.click(getByText("Next"));
    fireEvent.change(getAllByLabelText("Title")[1], { target: { value: "KR 1" } });
    fireEvent.change(getByLabelText("Metric"), { target: { value: "%" } });
    fireEvent.change(getByLabelText("Target Value"), { target: { value: "100" } });
    fireEvent.click(getByText("Next"));
    fireEvent.change(getByLabelText("Description"), { target: { value: "SC 1" } });
    fireEvent.change(getByLabelText("Threshold"), { target: { value: "90" } });
    fireEvent.click(getByText("Next"));
    fireEvent.click(getByText("Submit"));
    await waitFor(() => expect(screen.getByText(/failed!/i)).toBeInTheDocument());
  });
});
