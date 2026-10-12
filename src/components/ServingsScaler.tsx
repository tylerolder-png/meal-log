interface Props {
  servings: number;
  onChange: (servings: number) => void;
}

export function ServingsScaler({ servings, onChange }: Props) {
  return (
    <div className="servings-scaler">
      <span className="servings-scaler__label">Servings</span>
      <div className="servings-scaler__control">
        <button
          type="button"
          className="servings-scaler__btn"
          onClick={() => onChange(Math.max(1, servings - 1))}
          aria-label="Fewer servings"
        >
          &minus;
        </button>
        <span className="servings-scaler__value">{servings}</span>
        <button
          type="button"
          className="servings-scaler__btn"
          onClick={() => onChange(servings + 1)}
          aria-label="More servings"
        >
          +
        </button>
      </div>
    </div>
  );
}
