import { render, screen } from "@testing-library/react";
import ProfileLayout from "../ProfileLayout";

jest.mock("@/components/SideNav", () => ({
  __esModule: true,
  default: (props: any) => <nav data-testid="sidenav" {...props} />,
}));

describe("ProfileLayout", () => {
  it("renders the profile page heading", () => {
    render(<ProfileLayout />);
    expect(screen.getByRole("heading", { name: /profile page/i })).toBeInTheDocument();
  });

  it("renders the SideNav component", () => {
    render(<ProfileLayout />);
    expect(screen.getByTestId("sidenav")).toBeInTheDocument();
  });

  it("renders the Paper container", () => {
    render(<ProfileLayout />);
    expect(screen.getByText(/profile page/i).closest(".MuiPaper-root")).toBeInTheDocument();
  });
});
