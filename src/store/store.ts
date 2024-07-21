// store.ts

import { defineStore } from 'pinia';
import { state } from './state';
import { actions } from './actions';
import { getters } from './getters';

export const useNotesStore = defineStore('notes', {
  state,
  actions,
  getters,
});
