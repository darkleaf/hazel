import {useState} from 'react';

import TodomvcAppCss from "todomvc-app-css/index.css";
import TodomvcCommon from "todomvc-common/base.css";
import AppCss from "./app.css";

import Header from './Header.jsx';
import Main   from './Main.jsx';
import Footer from './Footer.jsx';

import DB from "../db/DB.js";

async function loaderImpl(address) {
  const url = "/segment/" + address;
  const resp = await fetch(url);
  const json = await resp.json();
  return json;
}

const cache = new Map()
async function loader(address) {
  if (cache.has(address)) return await cache.get(address);
  const promise = loaderImpl(address);
  cache.set(address, promise);
  return await promise;
}

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
  const [db, setDb] = useState(new DB(window.initialRoots, loader));

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
              transact={doTransact} />
        {/* <Footer /> */}
      </div>
    </>)
}
