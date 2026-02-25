import React from "react";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar/Navbar";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/styles/Navbar.module.css", () => ({
  navbar: "navbar",
  logo: "logo",
  links: "links",
  link: "link",
  linkActive: "linkActive",
}));

import { usePathname } from "next/navigation";

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("Navbar", () => {
  it("renders all navigation items", () => {
    mockUsePathname.mockReturnValue("/");

    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Turnos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registro" })).toBeInTheDocument();
  });

  it("renders logo text", () => {
    mockUsePathname.mockReturnValue("/");

    render(<Navbar />);

    expect(screen.getByText(/Sistema de/i)).toBeInTheDocument();
  });

  it("renders correct href for each nav item", () => {
    mockUsePathname.mockReturnValue("/");

    render(<Navbar />);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/dashboard");
    expect(hrefs).toContain("/register");
  });

  it("applies active class to the link matching current pathname", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<Navbar />);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink.className).toBe("linkActive");
  });

  it("applies inactive class to links not matching current pathname", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<Navbar />);

    const turnosLink = screen.getByRole("link", { name: "Turnos" });
    expect(turnosLink.className).toBe("link");
  });
});
