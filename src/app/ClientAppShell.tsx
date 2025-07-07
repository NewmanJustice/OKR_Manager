"use client";
import NavBarClient from "./NavBarClient";
import BreadcrumbsClient from "./BreadcrumbsClient";
import JoyThemeProvider from "./JoyThemeProvider";
import EmotionCacheProvider from "./EmotionCacheProvider";

export default function ClientAppShell({ children }: { children: React.ReactNode }) {
  return (
    <EmotionCacheProvider>
      <JoyThemeProvider>
        <NavBarClient />
        <BreadcrumbsClient />
        <main>{children}</main>
      </JoyThemeProvider>
    </EmotionCacheProvider>
  );
}
