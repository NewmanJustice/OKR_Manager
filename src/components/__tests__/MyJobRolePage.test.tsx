import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import MyJobRolePage from "../../app/my-job-role/page";
import { SessionProvider } from "next-auth/react";

function renderWithSession(session: any) {
  return render(
    <SessionProvider session={session}>
      <MyJobRolePage />
    </SessionProvider>
  );
}

describe("MyJobRolePage", () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/api/my-job-role-description")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ description: { jobRole: { name: "Engineer" }, content: "<p>Engineer role description</p>" } })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("shows job role description if found", async () => {
    renderWithSession({ user: { id: 1, jobRoleId: 1 } });
    expect(await screen.findByText(/Engineer Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Engineer role description/i)).toBeInTheDocument();
  });

  it("shows placeholder if not found", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ description: null }) }));
    renderWithSession({ user: { id: 1, jobRoleId: 1 } });
    expect(await screen.findByText(/No job role description found/i)).toBeInTheDocument();
  });

  it("redirects to login if unauthenticated", async () => {
    renderWithSession(null);
    // Should not render page content
    await waitFor(() => {
      expect(screen.queryByText(/My Job Role/i)).not.toBeInTheDocument();
    });
  });
});
