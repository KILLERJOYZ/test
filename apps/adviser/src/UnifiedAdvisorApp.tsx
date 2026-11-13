import React from "react";
import DeviceAdvisorApp from "./DeviceAdvisorApp";
import { AdvisorTheme } from "./AdvisorTheme";

/** The only shipped root. Historical demos are retained for regression checks. */
export default function UnifiedAdvisorApp() {
  return (
    <AdvisorTheme>
      <DeviceAdvisorApp />
    </AdvisorTheme>
  );
}
