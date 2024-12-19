import Input from "./Input";

export default function Header({ transact }) {
  //const addItem = useCallback((title) => dispatch({ type: ADD_ITEM, payload: { title } }), [dispatch]);

  const addItem = text => {
    transact([{
      title: text,
      completed: false,
    }]);
  };

  return (
    <header className="header" data-testid="header">
      <h1>todos</h1>
      <Input onSubmit={addItem}
             label="New Todo Input" placeholder="What needs to be done?" />
    </header>
    );
}
