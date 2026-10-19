export interface Choice {
  value: string;
  label: string;
}

interface ChoiceFieldProps {
  label: string;
  choices: Choice[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string; // adds an "everything" option, e.g. "All my sequences"
}

// Shows a dropdown only when there's something to choose between.
// With a single choice it just states it; with none it shows nothing.
export function ChoiceField({
  label,
  choices,
  value,
  onChange,
  allLabel,
}: ChoiceFieldProps) {
  const [onlyChoice] = choices;
  if (!onlyChoice) return null;

  if (choices.length === 1) {
    return (
      <p className="choice-field">
        <span className="choice-field__label">{label}</span>
        {onlyChoice.label}
      </p>
    );
  }

  return (
    <label className="form-field choice-field">
      {label}
      <select
        className="text-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {allLabel && <option value="">{allLabel}</option>}
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </label>
  );
}
