import { fetchBoardColumns, type BoardColumns } from "../api/tasksApi";
import { useLoadedData } from "../../shotgrid/hooks/useLoadedData";

const fallback: BoardColumns = { columns: [], otherLabel: "Other" };

// The column list rarely changes, so it's loaded once per visit.
export function useBoardColumns(): BoardColumns {
  const { data } = useLoadedData(fetchBoardColumns);
  return data ?? fallback;
}
