import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileLayout from "../ProfileLayout";
import { SessionProvider } from "next-auth/react";

jest.mock("@/components/SideNav", () => ({
  __esModule: true,
  default: (props: any) => <nav data-testid="sidenav" {...props} />,
}));

global.fetch = jest.fn().mockImplementation((url, options) => {
  if (options && options.method === "PATCH") {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ user: { name: "Test User", email: "test@example.com", isLineManager: true }, sessionUpdate: false })
    });
  }
  // GET /api/profile
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ user: { isLineManager: true } })
  });
});

describe("ProfileLayout", () => {
  function renderWithSession(session: any = { user: { name: "Test User", email: "test@example.com" } }) {
    return render(
      <SessionProvider session={session}>
        <ProfileLayout />
      </SessionProvider>
    );
  }

  it("renders the profile page heading", () => {
    renderWithSession();
    expect(screen.getByRole("heading", { name: /profile page/i })).toBeInTheDocument();
  });

  it("renders the SideNav component", () => {
    renderWithSession();
    expect(screen.getByTestId("sidenav")).toBeInTheDocument();
  });

  it("renders the profile form fields", async () => {
    renderWithSession();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i am a line manager/i)).toBeInTheDocument();
  });

  it("submits the form and shows success message", async () => {
    renderWithSession();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "New Name" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "currentpass" } });
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "newpass123" } });
    fireEvent.click(screen.getByLabelText(/i am a line manager/i));
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });
});
