import classnames from "classnames";

// import { REMOVE_COMPLETED_ITEMS } from "../constants";

export default function Footer(/*{ todos, dispatch }*/) {
  const todos = []
  const activeTodos = []
  const route = "/"

  const removeCompleted = () => {}

  // if (todos.length === 0)
  //   return null;

  return (
    <footer className="footer" data-testid="footer">
      <span className="todo-count">{`${activeTodos.length} ${activeTodos.length === 1 ? "item" : "items"} left!`}</span>
      <ul className="filters" data-testid="footer-navigation">
        <li>
          <a className={classnames({ selected: route === "/" })} href="#/">
            All
          </a>
        </li>
        <li>
          <a className={classnames({ selected: route === "/active" })} href="#/active">
            Active
          </a>
        </li>
        <li>
          <a className={classnames({ selected: route === "/completed" })} href="#/completed">
            Completed
          </a>
        </li>
      </ul>
      <button className="clear-completed" disabled={activeTodos.length === todos.length} onClick={removeCompleted}>
        Clear completed
      </button>
    </footer>
  );
}
