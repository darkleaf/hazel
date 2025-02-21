import { useState } from 'react';
import classnames from "classnames";

import Input from './Input';

export default function Item({ todo, transact }) {
  const {title, completed} = todo;

  const toggleItem = () => {
    transact([{
      "db/id": todo.id,
      completed: !todo.completed,
    }])
  };

  const removeItem = () => {
    transact([
      ["db.fn/retractEntity", todo.id],
    ])
  };

  const [isWritable, setIsWritable] = useState(false);

  const handleDoubleClick = () => {
    setIsWritable(true);
  };
  const handleBlur = () => {
     setIsWritable(false);
  };

  const handleUpdate = (title) => {
    if (title.length === 0) {
      removeItem();
    } else {
      transact([
        {
          "db/id": todo.id,
          title,
        }
      ]);
    }
    setIsWritable(false);
  };

  return (
    <li className={classnames({ completed })} data-testid="todo-item">
      <div className="view">
        {isWritable ? (
          <Input onSubmit={handleUpdate}
                 label="Edit Todo Input"
                 defaultValue={title}
                 onBlur={handleBlur} />
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
