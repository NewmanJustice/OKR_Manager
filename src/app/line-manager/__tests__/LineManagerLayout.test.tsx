import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import LineManagerLayout from "../LineManagerLayout";

jest.mock("@/components/SideNav", () => ({
  __esModule: true,
  default: (props: any) => <nav data-testid="sidenav" {...props} />,
}));

global.fetch = jest.fn().mockImplementation((url, options) => {
  if (url === "/api/invite" && (!options || options.method === "GET")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ invites: [
        { id: 1, email: "test@example.com", token: "abc123", status: "unused", dateSent: new Date().toISOString(), dateUsed: null },
        { id: 2, email: "used@example.com", token: "def456", status: "used", dateSent: new Date().toISOString(), dateUsed: new Date().toISOString() }
      ] })
    });
  }
  if (url === "/api/invite" && options?.method === "POST") {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }
  if (url === "/api/invite/resend" && options?.method === "POST") {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }
  return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: "API error" }) });
});

describe("LineManagerLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dashboard title", () => {
    render(<LineManagerLayout />);
    expect(screen.getByText(/Line Manager Dashboard/i)).toBeInTheDocument();
  });

  it("renders the SideNav and allows closing", () => {
    render(<LineManagerLayout />);
    expect(screen.getByTestId("sidenav")).toBeInTheDocument();
    // Simulate closing SideNav
    fireEvent.click(screen.getByTestId("sidenav"));
    // You may want to check state change if SideNav exposes it
  });

  it("matches styling with other pages", () => {
    render(<LineManagerLayout />);
    const paper = screen.getByText(/Line Manager Dashboard/i).closest('div');
    expect(paper).toHaveStyle({ width: 'fit-content' });
  });

  it("renders dashboard and invite form", () => {
    render(<LineManagerLayout />);
    expect(screen.getByText(/Line Manager Dashboard/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Invitee's Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Invitee's Email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send Invite/i })).toBeInTheDocument();
  });

  it("renders sent invites table", async () => {
    render(<LineManagerLayout />);
    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("used@example.com")).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /Resend/i }).length).toBeGreaterThan(0);
    });
  });

  it("submits invite form and shows success", async () => {
    render(<LineManagerLayout />);
    fireEvent.change(screen.getByLabelText(/Invitee's Name/i), { target: { value: "New User" } });
    fireEvent.change(screen.getByLabelText(/Invitee's Email/i), { target: { value: "newuser@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Send Invite/i }));
    await waitFor(() => {
      expect(screen.getByText(/Invite sent successfully/i)).toBeInTheDocument();
    });
  });

  it("copies invite link to clipboard", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn() }
    });
    render(<LineManagerLayout />);
    await waitFor(() => {
      const copyButtons = screen.getAllByRole("button", { name: "" });
      fireEvent.click(copyButtons[0]);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(screen.getByText(/Invite link copied to clipboard/i)).toBeInTheDocument();
    });
  });

  it("resends invite and shows success", async () => {
    render(<LineManagerLayout />);
    await waitFor(() => {
      const resendButtons = screen.getAllByRole("button", { name: /Resend/i });
      fireEvent.click(resendButtons[0]);
    });
    await waitFor(() => {
      expect(screen.getByText(/Invite resent successfully/i)).toBeInTheDocument();
    });
  });
});
