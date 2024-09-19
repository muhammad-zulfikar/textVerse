// index.ts

import { defineStore } from 'pinia';
import stateFactory from './state';
import * as actions from './actions';
import { UIState } from '@/utils/types';

type ActionType = typeof actions;

type StoreActions = {
  [K in keyof ActionType]: ActionType[K] extends (
    state: UIState,
    ...args: infer P
  ) => infer R
    ? (...args: P) => R
    : never;
};

export const useUIStore = defineStore('ui', {
  state: stateFactory,
  actions: Object.fromEntries(
    Object.entries(actions).map(([key, action]) => [
      key,
      function (this: UIState, ...args: any[]) {
        return (action as any)(this, ...args);
      },
    ])
  ) as StoreActions,
});
