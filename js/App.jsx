import TodomvcAppCss from "todomvc-app-css/index.css";
import TodomvcCommon from "todomvc-common/base.css";
import AppCss from "./app.css";

import Header from './components/Header.jsx';
import Main from './components/Main.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <link rel="stylesheet" precedence="medium" href={TodomvcCommon} />
      <link rel="stylesheet" precedence="medium" href={TodomvcAppCss} />
      <link rel="stylesheet" precedence="medium" href={AppCss} />

      <div className="todoapp">
        <Header />
        <Main />
        <Footer />
      </div>
    </>)
}
