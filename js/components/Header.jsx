import Input from "./Input";

//import { ADD_ITEM } from "../constants";

export default function Header(/*{ dispatch }*/) {
  //const addItem = useCallback((title) => dispatch({ type: ADD_ITEM, payload: { title } }), [dispatch]);


  const addItem = () => {};


  return (
    <header className="header" data-testid="header">
      <h1>todos</h1>
      <Input onSubmit={addItem} label="New Todo Input" placeholder="What needs to be done?" />
    </header>
    );
}
