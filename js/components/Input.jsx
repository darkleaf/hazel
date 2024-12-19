// могло бы уехать в валидации,
// в датомике есть, в датаскрипте - не знаю
const hasValidMin = (value, min) => {
  return value.length >= min;
};

export default function Input({ onSubmit, placeholder, label, defaultValue, onBlur }) {

  const handleBlur = () => {}

  // const handleBlur = useCallback(() => {
  //   if (onBlur)
  //     onBlur();
  // }, [onBlur]);

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      const value = e.target.value.trim();

      if (!hasValidMin(value, 2))
        return;

      onSubmit(value);
      e.target.value = "";
    }
  }

  return (
    <div className="input-container">
      <input className="new-todo"
             id="todo-input"
             type="text"
             data-testid="text-input"
             autoFocus
             placeholder={placeholder}
             defaultValue={defaultValue}
             onBlur={handleBlur}
             onKeyDown={handleKeyDown} />
      <label className="visually-hidden"
             htmlFor="todo-input">
        {label}
      </label>
    </div>
  );
}
