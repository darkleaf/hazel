import {useState} from 'react';

import TodomvcAppCss from "todomvc-app-css/index.css";
import TodomvcCommon from "todomvc-common/base.css";
import AppCss from "./app.css";

import Header from './components/Header.jsx';
import Main from './components/Main.jsx';
import Footer from './components/Footer.jsx';

import DB from "./db/DB.js";

async function loader(address) {
  const url = "/segment/" + address;
  const resp = await fetch(url);
  const json = await resp.json();
  return json;
}

export default function App() {
  const [db, setDb] = useState(new DB(window.initialRoots, loader));

  return (
    <>
      <link rel="stylesheet" precedence="medium" href={TodomvcCommon} />
      <link rel="stylesheet" precedence="medium" href={TodomvcAppCss} />
      <link rel="stylesheet" precedence="medium" href={AppCss} />

      <div className="todoapp">
        {/* <Header /> */}
        <Main db={db} />
        {/* <Footer /> */}
      </div>
    </>)
}
