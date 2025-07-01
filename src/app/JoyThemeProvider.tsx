"use client";
import * as React from "react";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";

// Custom Joy UI theme to make all buttons black with white text, and #e8890c on hover
const theme = extendTheme({
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#000",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#e8890c",
            color: "#fff",
          },
        },
      },
    },
  },
});

export default function JoyThemeProvider({ children }: { children: React.ReactNode }) {
  return <CssVarsProvider theme={theme}>{children}</CssVarsProvider>;
}
