import '@testing-library/jest-dom';
import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../../app/page";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react");

const mockedUseSession = useSession as unknown as jest.MockedFunction<typeof useSession>;

describe("Home page authentication redirect", () => {
  it("renders login form for unauthenticated users", () => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: jest.fn(),
    });
    render(<Home />);
    expect(screen.getByText("Welcome to OKR Manager")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows authenticated message for signed-in users", () => {
    mockedUseSession.mockReturnValue({
      data: {
        user: { name: "Demo User" },
        expires: "2099-12-31T23:59:59.999Z"
      },
      status: "authenticated",
      update: jest.fn(),
    });
    render(<Home />);
    expect(screen.getByText(/authenticated! welcome to objectives manager/i)).toBeInTheDocument();
  });
});
