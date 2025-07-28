import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import UserDashboard from "../UserDashboard";
import ObjectivesList from "../ObjectivesList";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react");
jest.mock("../ObjectivesList", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="objectives-list">ObjectivesListMock</div>)
}));

const mockedUseSession = useSession as unknown as jest.MockedFunction<typeof useSession>;

describe("UserDashboard", () => {
  it("renders welcome and objectives list for authenticated user (no logout button)", async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: "Demo User", email: "demo@example.com" }, expires: "2099-12-31T23:59:59.999Z" },
      status: "authenticated",
      update: jest.fn(),
    });
    render(<UserDashboard />);
    expect(screen.getByText("OKR Manager")).toBeInTheDocument();
    expect(screen.getByText("Welcome, Demo User!")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("objectives-list")).toBeInTheDocument();
    });
  });

  it("does not render objectives list if not authenticated", () => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: jest.fn(),
    });
    render(<UserDashboard />);
    expect(screen.getByText("OKR Manager")).toBeInTheDocument();
    expect(screen.getByText("Welcome, User!")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("objectives-list")).not.toBeInTheDocument();
  });
});
