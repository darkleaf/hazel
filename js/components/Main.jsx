import { useState, useEffect } from "react";

import Item from "./Item";
import classnames from "classnames";

export default function Main({ db }) {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    let stopped = false;
    (async function() {
      for await (const datom of db.ave.datoms("completed")) {
        const todo = {
          id: datom[0],
        };
        for await (const [_, a, v] of db.eav.datoms(todo.id)) {
          todo[a] = v;
        }
        if(stopped) break;

        setTodos(todos => [...todos, todo]);
      }
    })();

    return () => {
      stopped = true;
      setTodos([]);
    };
  }, [db]);

  const toggleAll = () => {};

  return (
    <main className="main" data-testid="main">
      {/*visibleTodos.length > 0 ? (
        <div className="toggle-all-container">
          <input className="toggle-all" type="checkbox" id="toggle-all" data-testid="toggle-all" checked={visibleTodos.every((todo) => todo.completed)} onChange={toggleAll} />
          <label className="toggle-all-label" htmlFor="toggle-all">
            Toggle All Input
          </label>
        </div>
      ) : null*/}
      <ul className="todo-list" data-testid="todo-list">
        {todos.map(todo => (
          <Item todo={todo} key={todo.id} />
        ))}
      </ul>
    </main>
  );
}
