import { useState } from "react";
import { AuthGate } from "./features/auth/AuthGate";
import { FileBrowser } from "./features/file-browser/FileBrowser";
import { Navbar } from "./features/navigation/Navbar";
import type { NavItemId } from "./features/navigation/config/navItems";
import { TeamPage } from "./features/team/TeamPage";
import { ShotgridPage } from "./features/shotgrid/ShotgridPage";
import { ProvenancePage } from "./features/provenance/ProvenancePage";
import { TasksPage } from "./features/tasks/TasksPage";

function SignedInApp() {
  const [activeSection, setActiveSection] = useState<NavItemId>("storage");

  return (
    <div className="app-layout">
      <Navbar activeItemId={activeSection} onSelectItem={setActiveSection} />
      {activeSection === "storage" && <FileBrowser />}
      {activeSection === "team" && <TeamPage />}
      {activeSection === "shotgrid" && <ShotgridPage />}
      {activeSection === "provenance" && <ProvenancePage />}
      {activeSection === "tasks" && <TasksPage />}
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <SignedInApp />
    </AuthGate>
  );
}
