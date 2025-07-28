"use client";
import React, { useState } from "react";
import CreateObjectiveWizard from "@/components/CreateObjectiveWizard";
import SideNav from "@/components/SideNav";

export default function CreateObjectivePage() {
  const [sideNavOpen, setSideNavOpen] = useState(true);
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <div style={{ flex: 1 }}>
        <CreateObjectiveWizard />
      </div>
    </div>
  );
}
