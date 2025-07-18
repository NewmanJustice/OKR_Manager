"use client";
import NavBarClient from "./NavBarClient";
import BreadcrumbsClient from "./BreadcrumbsClient";
import JoyThemeProvider from "./JoyThemeProvider";
import EmotionCacheProvider from "./EmotionCacheProvider";
import SessionProviderWrapper from "./SessionProviderWrapper";

export default function ClientAppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderWrapper>
      <EmotionCacheProvider>
        <JoyThemeProvider>
          <NavBarClient />
          <BreadcrumbsClient />
          <main>{children}</main>
        </JoyThemeProvider>
      </EmotionCacheProvider>
    </SessionProviderWrapper>
  );
}
