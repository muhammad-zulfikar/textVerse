// index.ts

import { defineStore } from 'pinia';
import stateFactory from './state';
import getters from './getters';
import * as actions from './actions';
import * as helpers from './helpers';
import { NotesState } from '@/utils/types';

type ActionType = typeof actions & typeof helpers;

type StoreActions = {
  [K in keyof ActionType]: ActionType[K] extends (
    state: NotesState,
    ...args: infer P
  ) => infer R
    ? (...args: P) => R
    : never;
};

export const useNotesStore = defineStore('notes', {
  state: stateFactory,
  getters,
  actions: Object.fromEntries(
    [...Object.entries(actions), ...Object.entries(helpers)].map(
      ([key, action]) => [
        key,
        function (this: NotesState, ...args: any[]) {
          return (action as any)(this, ...args);
        },
      ]
    )
  ) as StoreActions,
});
