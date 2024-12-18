import Item from "./Item";
import classnames from "classnames";

// import { TOGGLE_ALL } from "../constants";

export default function Main({ todos, dispatch }) {
  const visibleTodos = []

  const toggleAll = () => {};

  return (
    <main className="main" data-testid="main">
      {visibleTodos.length > 0 ? (
        <div className="toggle-all-container">
          <input className="toggle-all" type="checkbox" id="toggle-all" data-testid="toggle-all" checked={visibleTodos.every((todo) => todo.completed)} onChange={toggleAll} />
          <label className="toggle-all-label" htmlFor="toggle-all">
            Toggle All Input
          </label>
        </div>
      ) : null}
      <ul className={classnames("todo-list")} data-testid="todo-list">
        {visibleTodos.map((todo, index) => (
          <Item todo={todo} key={todo.id} dispatch={dispatch} index={index} />
        ))}
      </ul>
    </main>
  );
}
