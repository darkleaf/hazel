import { useState, useEffect } from "react";

import Item from "./Item";
import classnames from "classnames";

export default function Main({ db, filter, transact }) {
  const [todos, setTodos] = useState([]);

  // todo: Consider updating in a wave-like fashion.
  // Keep the old values at the tail while the head and middle maintain the new values.

  useEffect(() => {
    let stopped = false;
    (async function() {
      for await (const datom of db.ave.datoms(
        "completed",
        (function() {
          switch(filter) {
          case 'active': return false;
          case 'completed': return true;
          default: return;
          }
        })()
      )) {
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
  }, [db, filter]);

  /*
  useEffect(() => {
    let stopped = false;
    (async function() {
      const res = [];
      for await (const datom of db.ave.datoms(
        "completed",
        (function() {
          switch(filter) {
          case 'active': return false;
          case 'completed': return true;
          default: return;
          }
        })()
      )) {
        const todo = {
          id: datom[0],
        };
        for await (const [_, a, v] of db.eav.datoms(todo.id)) {
          todo[a] = v;
        }
        if(stopped) break;

        res.push(todo);
        //setTodos(todos => [...todos, todo]);
      }

      setTodos(res);
    })();

    return () => {
      stopped = true;
      setTodos([]);
    };
  }, [db, filter]);
  */

  const toggleAll = (e) => {
    transact(todos.map(todo => ({
      "db/id": todo.id,
      completed: e.target.checked,
    })));
  };

  return (
    <main className="main" data-testid="main">
      {todos.length > 0 && (
        <div className="toggle-all-container">
          <input className="toggle-all"
                 type="checkbox"
                 id="toggle-all"
                 data-testid="toggle-all"
                 checked={todos.every(todo => todo.completed)}
                 onChange={toggleAll} />
          <label className="toggle-all-label"
                 htmlFor="toggle-all">
            Toggle All Input
          </label>
        </div>
      )}
      <ul className="todo-list" data-testid="todo-list">
        {todos.map(todo => (
          <Item todo={todo} key={todo.id} transact={transact} />
        ))}
      </ul>
    </main>
  );
}
