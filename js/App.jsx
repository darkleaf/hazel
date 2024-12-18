import TodomvcAppCss from "todomvc-app-css/index.css";
import TodomvcCommon from "todomvc-common/base.css";

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <link rel="stylesheet" precedence="medium" href={TodomvcAppCss} />
      <link rel="stylesheet" precedence="medium" href={TodomvcCommon} />
      <Header />
      <Footer />
    </>)
}
