import { useEffect, useState } from "react";
import {
  fetchProvenanceProjects,
  type ProvenanceProject,
} from "../api/provenanceApi";

// The project list, plus which one is chosen. Opens on the default project.
export function useProvenanceProjects() {
  const [projects, setProjects] = useState<ProvenanceProject[]>([]);
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    fetchProvenanceProjects()
      .then((found) => {
        if (isCurrent) setProjects(found);
      })
      .catch((cause: unknown) => {
        if (isCurrent)
          setError(
            cause instanceof Error ? cause.message : "Could not load projects."
          );
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const projectId =
    pickedId ?? projects.find((project) => project.isDefault)?.id ?? null;
  return { projects, projectId, setProjectId: setPickedId, error };
}
