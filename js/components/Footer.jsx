import classnames from "classnames";

export default function Footer({ filter, setFilter }) {
  return (
    <footer className="footer" data-testid="footer">
      <ul className="filters" data-testid="footer-navigation">
        <li>
          <a className={classnames({ selected: filter === "all" })}
             onClick={() => setFilter('all')}>
            All
          </a>
        </li>
        <li>
          <a className={classnames({ selected: filter === "active" })}
             onClick={() => setFilter('active')}>
            Active
          </a>
        </li>
        <li>
          <a className={classnames({ selected: filter === "completed" })}
             onClick={() => setFilter('completed')}>
            Completed
          </a>
        </li>
      </ul>
    </footer>
  );
}
