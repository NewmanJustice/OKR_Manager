import React from "react";
import { render, screen } from "@testing-library/react";
import LoginForm from "../LoginForm";

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
});
