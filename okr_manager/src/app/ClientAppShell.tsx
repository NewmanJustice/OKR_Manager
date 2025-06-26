"use client";
import NavBarClient from "./NavBarClient";
import BreadcrumbsClient from "./BreadcrumbsClient";
import JoyThemeProvider from "./JoyThemeProvider";

export default function ClientAppShell({ children }: { children: React.ReactNode }) {
  return (
    <JoyThemeProvider>
      <NavBarClient />
      <BreadcrumbsClient />
      <main>{children}</main>
    </JoyThemeProvider>
  );
}
