import React, {
  useMemo,
  useReducer,
  Dispatch,
  useEffect,
  useState,
} from "react";
import { BehaviorSubject, Subject, Subscription } from "rxjs";

export default <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  subscribe: (init: {
    subject: Subject<{ oldState: S; state: S; action: A }>;
    dispatch: Dispatch<A>;
  }) => Subscription[]
): [S, React.Dispatch<any>, Subscription[]] => {
  const subject = useMemo(
    () =>
      new BehaviorSubject<{ oldState: S; state: S; action: A }>({
        oldState: initialState,
        state: initialState,
        action: { type: "__INIT__" },
      }),
    []
  );

  const r = useMemo(
    () => (state: S, action) => {
      const newState = reducer(state, action);
      subject.next({ oldState: state, state: newState, action });
      return newState;
    },
    [subject]
  );

  const [state, dispatch] = useReducer(r, initialState);

  const [queue, setQueue] = useState([]);

  useEffect(() => {
    queue.forEach((action) => dispatch(action));
    queue.splice(0, queue.length);
  }, [queue]);

  const d = (action) => {
    const newQueue = [...queue, action];
    setQueue(newQueue);
    return newQueue;
  };

  const subscriptions = useMemo(() => subscribe({ subject, dispatch: d }), [
    subject,
  ]);

  return [state, dispatch, subscriptions];
};
