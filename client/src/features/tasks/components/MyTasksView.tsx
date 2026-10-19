import { useState } from "react";
import { fetchMyTasks } from "../api/tasksApi";
import { useLoadedData } from "../../shotgrid/hooks/useLoadedData";
import { filterTasks, showAll, stepsIn } from "../helpers/taskFilters";
import { TaskBoard } from "./TaskBoard";

export function MyTasksView() {
  const { data, isLoading, error } = useLoadedData(fetchMyTasks);
  const [step, setStep] = useState(showAll);

  if (isLoading) return <p className="tasks-page__note">Loading your tasks…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!data || data.matchingShotgridUsers !== 1) {
    return (
      <p className="tasks-page__note">
        {data && data.matchingShotgridUsers > 1
          ? "More than one ShotGrid person has your exact name, so your tasks can't be picked out. Ask a lead to sort this out."
          : "No ShotGrid person has your exact name. Ask a lead to check that your name here matches your name in ShotGrid."}
      </p>
    );
  }
  if (data.tasks.length === 0) {
    return (
      <p className="tasks-page__note">
        Nothing is assigned to you in ShotGrid right now.
      </p>
    );
  }

  const steps = stepsIn(data.tasks);
  const tasks = filterTasks(data.tasks, showAll, step);

  return (
    <>
      {steps.length > 1 && (
        <div className="tasks-page__toolbar">
          <label className="form-field">
            Step
            <select
              className="text-input"
              value={step}
              onChange={(event) => setStep(event.target.value)}
            >
              <option value={showAll}>All steps</option>
              {steps.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <span className="tasks-page__note">
            {tasks.length} of {data.tasks.length} tasks
          </span>
        </div>
      )}
      <TaskBoard tasks={tasks} showAssignees={false} />
    </>
  );
}
