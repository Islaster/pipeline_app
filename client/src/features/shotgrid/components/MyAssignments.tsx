import { useState } from "react";
import type { ShotgridAssignment } from "../../../../../shared/types/shotgrid";
import { fetchMyAssignments } from "../api/shotgridApi";
import { useLoadedData } from "../hooks/useLoadedData";
import { ChoiceField, type Choice } from "./ChoiceField";

function projectChoices(assignments: ShotgridAssignment[]): Choice[] {
  const namesById = new Map<string, string>();
  for (const { project } of assignments) {
    if (project) namesById.set(String(project.id), project.name);
  }
  return [...namesById]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function sequenceChoices(assignments: ShotgridAssignment[]): Choice[] {
  const names = new Set(
    assignments.flatMap((assignment) => assignment.sequence ?? [])
  );
  return [...names].sort().map((name) => ({ value: name, label: name }));
}

export function MyAssignments() {
  const { data, isLoading, error } = useLoadedData(fetchMyAssignments);
  const [chosenProject, setChosenProject] = useState("");
  const [chosenSequence, setChosenSequence] = useState("");

  if (isLoading)
    return <p className="shotgrid-page__note">Loading your assignments…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!data || data.matchingShotgridUsers !== 1) {
    return (
      <p className="shotgrid-page__note">
        {data && data.matchingShotgridUsers > 1
          ? "More than one ShotGrid person has your exact name, so your assignments can't be picked out. Ask a lead to sort this out."
          : "No ShotGrid person has your exact name. Ask a lead to check that your name here matches your name in ShotGrid."}
      </p>
    );
  }
  if (data.assignments.length === 0) {
    return (
      <p className="shotgrid-page__note">
        Nothing is assigned to you in ShotGrid right now.
      </p>
    );
  }

  // Project: with one there's nothing to choose; with several, start on the first.
  const projects = projectChoices(data.assignments);
  const projectId = projects.some((project) => project.value === chosenProject)
    ? chosenProject
    : projects[0]?.value ?? "";
  const inProject = data.assignments.filter(
    (assignment) => String(assignment.project?.id ?? "") === projectId
  );

  // Sequence: same idea, except several sequences default to showing all of them.
  const sequences = sequenceChoices(inProject);
  const [onlySequence] = sequences;
  const sequence =
    sequences.length === 1 && onlySequence
      ? onlySequence.value
      : sequences.some((choice) => choice.value === chosenSequence)
      ? chosenSequence
      : "";
  const visible = (
    sequence ? inProject.filter((a) => a.sequence === sequence) : inProject
  ).sort((a, b) => (a.entityName ?? "").localeCompare(b.entityName ?? ""));

  return (
    <section>
      <div className="assignments__scope">
        <ChoiceField
          label="Project"
          choices={projects}
          value={projectId}
          onChange={(value) => {
            setChosenProject(value);
            setChosenSequence(""); // sequences belong to a project
          }}
        />
        <ChoiceField
          label="Sequence"
          choices={sequences}
          value={sequence}
          onChange={setChosenSequence}
          allLabel="All my sequences"
        />
      </div>

      <table className="shot-table">
        <thead>
          <tr>
            <th>Shot</th>
            <th>Sequence</th>
            <th>Task</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((assignment) => (
            <tr key={assignment.taskId}>
              <td>{assignment.entityName ?? "—"}</td>
              <td>{assignment.sequence ?? "—"}</td>
              <td>{assignment.taskName}</td>
              <td>
                {assignment.status ? (
                  <span className="shot-table__status">
                    {assignment.status}
                  </span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
