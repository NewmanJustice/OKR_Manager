import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import SideNav from "../SideNav";

const navLinks = [
  "Dashboard",
  "Create Objective",
  "Profile",
  "Settings",
  "Logout"
];

describe("SideNav", () => {
  it("renders all nav links when open", () => {
    render(<SideNav open={true} onClose={jest.fn()} />);
    navLinks.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it("does not render nav links when closed (temporary)", () => {
    render(<SideNav open={false} onClose={jest.fn()} />);
    navLinks.forEach((text) => {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked (mobile)", () => {
    // Force mobile mode
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
    render(<SideNav open={true} onClose={onClose} />);
    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when a nav link is clicked", () => {
    const onClose = jest.fn();
    render(<SideNav open={true} onClose={onClose} />);
    const link = screen.getByText("Create Objective");
    fireEvent.click(link);
    expect(onClose).toHaveBeenCalled();
  });
});
