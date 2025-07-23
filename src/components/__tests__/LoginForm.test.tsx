import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "../LoginForm";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(() => Promise.resolve({ error: "Invalid credentials" }))
}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe("LoginForm", () => {
  it("renders heading and login button", () => {
    render(<LoginForm />);
    expect(screen.getByText("Welcome to OKR Manager")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("renders email and password input fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders register link", () => {
    render(<LoginForm />);
    expect(screen.getByText(/don't have an account\? register/i)).toBeInTheDocument();
  });

  it("shows error message on failed login", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "wrong@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
