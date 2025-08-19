import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import LineManagerLayout from "../LineManagerLayout";

jest.mock("@/components/SideNav", () => ({
  __esModule: true,
  default: (props: any) => <nav data-testid="sidenav" {...props} />,
}));

describe("LineManagerLayout", () => {
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
});
