import React, { useMemo, Dispatch, useCallback } from 'react';

const storageKey = 'nile-quickstart-theme';
const storage =
  typeof localStorage !== 'undefined' && localStorage.getItem(storageKey);

const defaultState = storage ? JSON.parse(storage) : { primary: '#d100ce' };

enum Actions {
  Color = '@theme/color',
}

type DispatchAction = {
  type: Actions;
  color: State;
};

type State = {
  primary: string;
};

const Context = React.createContext<[State, Dispatch<DispatchAction>]>([
  defaultState,
  () => null,
]);

Context.displayName = 'Theme';

type ProviderProps = { children: React.ReactNode };

type Reducer = (state: State, action: DispatchAction) => State;

const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case Actions.Color:
      localStorage.setItem(storageKey, JSON.stringify(action.color));
      return action.color;
    default:
      localStorage.setItem(storageKey, JSON.stringify(action.color));
      return state;
  }
};

export function Provider(props: ProviderProps) {
  const { children } = props;

  const [state, dispatch] = React.useReducer(reducer, defaultState);

  const values: [State, Dispatch<DispatchAction>] = React.useMemo(
    () => [state, dispatch],
    [state]
  );
  return <Context.Provider value={values}>{children}</Context.Provider>;
}

export const useTheme = () => {
  const [state] = React.useContext(Context);
  return useMemo(() => state, [state]);
};

export const useUpdateColor = () => {
  const [, dispatch] = React.useContext(Context);
  return useCallback(
    (color: State) => {
      return dispatch({ color, type: Actions.Color });
    },
    [dispatch]
  );
};
