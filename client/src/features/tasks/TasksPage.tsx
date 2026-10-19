import { useState } from "react";
import { useAuth } from "../auth/hooks/useAuth";
import { MyTasksView } from "./components/MyTasksView";
import { ProjectTasksView } from "./components/ProjectTasksView";
import "./tasks.css";

type TasksScope = "mine" | "project";

export function TasksPage() {
  const { user } = useAuth();
  const canSeeProjectBoard =
    user?.role === "creative_lead" || user?.role === "lead";
  const [scope, setScope] = useState<TasksScope>("mine");

  const header = (
    <header className="tasks-page__header">
      <h1>Tasks</h1>
      {canSeeProjectBoard && (
        <div
          className="tasks-page__scope"
          role="group"
          aria-label="Which tasks"
        >
          <button
            type="button"
            aria-pressed={scope === "mine"}
            className={`tasks-page__scope-option${
              scope === "mine" ? " tasks-page__scope-option--active" : ""
            }`}
            onClick={() => setScope("mine")}
          >
            My tasks
          </button>
          <button
            type="button"
            aria-pressed={scope === "project"}
            className={`tasks-page__scope-option${
              scope === "project" ? " tasks-page__scope-option--active" : ""
            }`}
            onClick={() => setScope("project")}
          >
            Project board
          </button>
        </div>
      )}
    </header>
  );

  if (canSeeProjectBoard && scope === "project") {
    return <ProjectTasksView header={header} />;
  }

  return (
    <main className="tasks-page">
      {header}
      <MyTasksView />
    </main>
  );
}
