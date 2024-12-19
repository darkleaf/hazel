import classnames from "classnames";

export default function Item({ todo, transact }) {
  const {title, completed} = todo;
  const isWritable = false;

  const toggleItem = () => {};
  const handleDoubleClick = () => {};
  const removeItem = () => {
    transact([
      ["db.fn/retractEntity", todo.id],
    ])
  };

  return (
    <li className={classnames({ completed })} data-testid="todo-item">
      <div className="view">
        {isWritable ? (
          <Input onSubmit={handleUpdate} label="Edit Todo Input" defaultValue={title} onBlur={handleBlur} />
        ) : (
          <>
            <input className="toggle" type="checkbox" data-testid="todo-item-toggle" checked={completed} onChange={toggleItem} />
            <label data-testid="todo-item-label" onDoubleClick={handleDoubleClick}>
              {title}
            </label>
            <button className="destroy" data-testid="todo-item-button" onClick={removeItem} />
          </>
        )}
      </div>
    </li>
  );
}
