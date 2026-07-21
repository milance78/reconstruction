import type { Middleware } from "@reduxjs/toolkit";

import {
  loadDraftFromStorage,
  saveDraftToStorage,
} from "../../localStorage/localStorage";

export const localStorageMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);
    const state = store.getState();

    if (state?.newIntervention) {
      const {
        documentId: _documentId,
        isEditing: _isEditing,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...draft
      } = state.newIntervention;

      saveDraftToStorage({
        ...draft,
        documentId: "",
        isEditing: false,
        createdAt: null,
        updatedAt: null,
      });
    }

    return result;
  };

export { loadDraftFromStorage };
