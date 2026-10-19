import type { ShotgridConnectionStatus } from "../../../../../shared/types/shotgrid";

interface ConnectionStatusProps {
  status: ShotgridConnectionStatus | null;
  isChecking: boolean;
  error: string | null;
  onCheckAgain: () => void;
}

export function ConnectionStatus({
  status,
  isChecking,
  error,
  onCheckAgain,
}: ConnectionStatusProps) {
  const isConnected = !isChecking && (status?.isConnected ?? false);
  const label = isChecking
    ? "Checking…"
    : isConnected
    ? "Connected"
    : "Not connected";
  const details = error ?? status?.message ?? "";

  return (
    <div className="shotgrid-status" title={details}>
      <span
        className={`shotgrid-status__dot${
          isConnected ? " shotgrid-status__dot--connected" : ""
        }`}
        aria-hidden="true"
      />
      <span>{label}</span>
      <button
        type="button"
        className="shotgrid-status__retry"
        aria-label="Check the connection again"
        disabled={isChecking}
        onClick={onCheckAgain}
      >
        ↻
      </button>
    </div>
  );
}
