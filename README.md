# use-observable-reducer

Custom react hook which allows you to get an RxJS subject that publishes the new state every time an action is dispatched to your reducer.

## Example usage - debouncing text input and updating server state after debounce time

```
interface Action {
  type: string;
  payload?: any;
}

interface State {
  text: string;
}

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "CHANGE_TEXT":
      return { ...state, text: action.payload };
    case "SAVE_SUCCESSFUL": // do something to indicate save succeeded
    case "SAVE_FAILED": // handle failed save
    default:
      return state;
  }
};

export const Example = () => {
  const [state, dispatch] = useObservableReducer(
    reducer,
    { text: "" }, // initialState
    ({ subject, dispatch }) => [ // subscribe function which takes subject and dispatch and returns array of subscriptions
      subject
        .pipe(
          filter(({ action }) => action.type === "CHANGE_TEXT"),
          debounceTime(500),
          tap(({ state }) =>
            fetch("/api/save_text", { body: state.text, method: "PUT" })
              .then(() => dispatch({ type: "SAVE_SUCCESSFUL" }))
              .catch(() => dispatch({ type: "SAVE_FAILED" }))
          )
        )
        .subscribe(),
    ]
  );

  return (
    <input
      value={state.text}
      onChange={({ target: { value } }) =>
        dispatch({ type: "CHANGE_TEXT", payload: value })
      }
    ></input>
  );
};
```
