import {useState} from 'react';

import TodomvcAppCss from "todomvc-app-css/index.css";
import TodomvcCommon from "todomvc-common/base.css";
import AppCss from "./app.css";

import Header from './Header.jsx';
import Main   from './Main.jsx';
import Footer from './Footer.jsx';

import DB from "../db/DB.js";

import { loader, wrapInMemoryCache, wrapStorageCache } from '../loader.js';

const myLoader = wrapInMemoryCache(
  await wrapStorageCache(
    loader
  )
);

async function transact(txData) {
  const resp = await fetch("/transact", {
    method: "POST",
    body: JSON.stringify(txData),
  });
  // todo: check status
  const roots = await resp.json();
  return roots;
}

export default function App() {
  const [db, setDb] = useState(new DB(window.initialRoots, myLoader));
  const [filter, setFilter] = useState('active');

  // useCallback? IDGAF!
  const doTransact = async function(txData) {
    const roots = await transact(txData);
    setDb(db => db.update(roots));
  }

  return (
    <>
      <link rel="stylesheet" precedence="medium" href={TodomvcCommon} />
      <link rel="stylesheet" precedence="medium" href={TodomvcAppCss} />
      <link rel="stylesheet" precedence="medium" href={AppCss} />

      <div className="todoapp">
        <Header transact={doTransact} />
        <Main db={db}
              filter={filter}
              transact={doTransact} />
        <Footer filter={filter}
                setFilter={setFilter} />
      </div>
    </>)
}
