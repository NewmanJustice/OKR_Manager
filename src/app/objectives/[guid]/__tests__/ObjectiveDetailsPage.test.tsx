import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import ObjectiveDetailsPage from "../page";

// Mock next/navigation and next-auth/react
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ guid: "test-guid" })
}));
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { email: "user@example.com" } }, status: "authenticated" })
}));

// Mock fetch for API calls
const mockObjective = {
  title: "Test Objective",
  description: "Test Desc",
  dueDate: "2025-12-31T00:00:00.000Z",
  keyResults: [
    {
      id: 1,
      title: "KR 1",
      metric: "%",
      targetValue: "100",
      successCriteria: [
        { id: 11, description: "SC 1", threshold: "90" }
      ]
    }
  ]
};

global.fetch = jest.fn().mockImplementation((url, opts) => {
  if (url === "/api/objectives/test-guid") {
    return Promise.resolve({ json: () => Promise.resolve({ objective: mockObjective }) });
  }
  if (url?.toString().includes("/keyResults") && opts?.method === "POST") {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }
  if (url?.toString().includes("/successCriteria") && opts?.method === "POST") {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }
  if (opts?.method === "PATCH" || opts?.method === "DELETE") {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ objective: mockObjective }) });
});

describe("ObjectiveDetailsPage", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("renders objective details and key results", async () => {
    render(<ObjectiveDetailsPage />);
    await waitFor(() => expect(screen.getByText("Edit your objective")).toBeInTheDocument());
    expect(screen.getByText("Test Objective")).toBeInTheDocument();
    expect(screen.getByText("KR 1: KR 1")).toBeInTheDocument();
    expect(screen.getByText("SC 1")).toBeInTheDocument();
  });

  it("opens and closes add key result dialog", async () => {
    render(<ObjectiveDetailsPage />);
    await waitFor(() => expect(screen.getByText("+ Add Key Result")).toBeInTheDocument());
    fireEvent.click(screen.getByText("+ Add Key Result"));
    expect(screen.getByText("Add Key Result")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Add Key Result")).not.toBeInTheDocument();
  });

  it("opens and closes add success criteria dialog", async () => {
    render(<ObjectiveDetailsPage />);
    await waitFor(() => expect(screen.getByText("+ Add Success Criteria")).toBeInTheDocument());
    fireEvent.click(screen.getByText("+ Add Success Criteria"));
    expect(screen.getByText("Add Success Criteria")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Add Success Criteria")).not.toBeInTheDocument();
  });

  it("can add a key result with success criteria", async () => {
    render(<ObjectiveDetailsPage />);
    await waitFor(() => expect(screen.getByText("+ Add Key Result")).toBeInTheDocument());
    fireEvent.click(screen.getByText("+ Add Key Result"));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "KR 2" } });
    fireEvent.change(screen.getByLabelText("Metric"), { target: { value: "#" } });
    fireEvent.change(screen.getByLabelText("Target Value"), { target: { value: "10" } });
    fireEvent.change(screen.getAllByLabelText("Description")[0], { target: { value: "SC 2" } });
    fireEvent.change(screen.getAllByLabelText("Threshold")[0], { target: { value: "5" } });
    fireEvent.click(screen.getByText("Add"));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      "/api/objectives/test-guid/keyResults",
      expect.objectContaining({ method: "POST" })
    ));
  });

  it("can add success criteria inline", async () => {
    render(<ObjectiveDetailsPage />);
    await waitFor(() => expect(screen.getByText("+ Add Success Criteria")).toBeInTheDocument());
    fireEvent.click(screen.getByText("+ Add Success Criteria"));
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "SC 3" } });
    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "7" } });
    fireEvent.click(screen.getByText("Add"));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/keyResults/1/successCriteria"),
      expect.objectContaining({ method: "POST" })
    ));
  });

  it("can edit and delete objective, key result, and success criteria", async () => {
    render(<ObjectiveDetailsPage />);
    await waitFor(() => expect(screen.getByLabelText("Edit")).toBeInTheDocument());
    // Edit objective
    fireEvent.click(screen.getAllByLabelText("Edit")[0]);
    expect(screen.getByText("Edit Objective")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    // Edit key result
    fireEvent.click(screen.getAllByLabelText("Edit")[1]);
    expect(screen.getByText("Edit KeyResult")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    // Edit success criteria
    fireEvent.click(screen.getAllByLabelText("Edit")[2]);
    expect(screen.getByText("Edit SuccessCriteria")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    // Delete objective
    fireEvent.click(screen.getAllByLabelText("Delete")[0]);
    expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    // Delete key result
    fireEvent.click(screen.getAllByLabelText("Delete")[1]);
    expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    // Delete success criteria
    fireEvent.click(screen.getAllByLabelText("Delete")[2]);
    expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
  });
});
