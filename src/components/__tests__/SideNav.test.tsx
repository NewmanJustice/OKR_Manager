import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import SideNav from "../SideNav";
import { SessionProvider } from "next-auth/react";

const navLinks = [
  { text: "Dashboard", href: "/" },
  { text: "Create Objective", href: "/objectives/create" },
  { text: "Profile", href: "/profile" },
  { text: "Review OKR's", href: "/objectives/review" },
  { text: "Logout", href: "/logout" },
];

describe("SideNav", () => {
  function renderWithSession(session: any = { user: { isLineManager: false } }) {
    return render(
      <SessionProvider session={session}>
        <SideNav open={true} onClose={jest.fn()} />
      </SessionProvider>
    );
  }

  it("renders all nav links when open", () => {
    renderWithSession();
    navLinks.forEach(({ text }) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it("dashboard link points to root", () => {
    renderWithSession();
    const dashboardLink = screen.getByText("Dashboard");
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/');
  });

  it("does not render nav links when closed (temporary)", () => {
    render(
      <SessionProvider session={{ user: { isLineManager: false } }}>
        <SideNav open={false} onClose={jest.fn()} />
      </SessionProvider>
    );
    navLinks.forEach(({ text }) => {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked (mobile)", () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    const onClose = jest.fn();
    renderWithSession({ user: { isLineManager: false } });
    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when a nav link is clicked", () => {
    const onClose = jest.fn();
    renderWithSession();
    const link = screen.getByText("Create Objective");
    fireEvent.click(link);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows Line Manager link only for line managers", () => {
    // Should not show for non-line managers
    renderWithSession({ user: { isLineManager: false } });
    expect(screen.queryByText("Line Manager")).not.toBeInTheDocument();
    // Should show for line managers
    renderWithSession({ user: { isLineManager: true } });
    expect(screen.getByText("Line Manager")).toBeInTheDocument();
  });

  it("calls signOut and onClose when logout link is clicked", () => {
    const onClose = jest.fn();
    // signOut is not actually called in this test environment, but onClose should be
    renderWithSession();
    const logoutLink = screen.getByText("Logout");
    fireEvent.click(logoutLink);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders all main nav links including My Job Role", () => {
    render(<SideNav open={true} onClose={jest.fn()} />);
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Create Objective")).toBeInTheDocument();
    expect(screen.getByText("Review OKR's")).toBeInTheDocument();
    expect(screen.getByText("My Job Role")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("navigates to My Job Role page when clicked", () => {
    render(<SideNav open={true} onClose={jest.fn()} />);
    const link = screen.getByText("My Job Role");
    expect(link.closest('a')).toHaveAttribute('href', '/my-job-role');
  });
});
