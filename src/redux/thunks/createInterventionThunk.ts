import { createAsyncThunk } from "@reduxjs/toolkit";
import { auth } from "../../firebase/firebaseConfig";
import { createIntervention } from "../../firebase/interventionsService";
import { clearTask } from "../features/newInterventionSlice";
import type { Intervention } from "../features/newInterventionSlice";

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createInterventionThunk = createAsyncThunk<
  Intervention,
  Intervention,
  { rejectValue: string }
>(
  "interventions/create",
  async (intervention, { dispatch, rejectWithValue }) => {
    try {
      await auth.authStateReady();
      const user = auth.currentUser;

      if (!user) {
        return rejectWithValue("User not authenticated");
      }

      const firestoreId = await createIntervention(
        user.uid,
        getLocalDate(),
        intervention,
      );

      const savedIntervention: Intervention = {
        ...intervention,
        documentId: firestoreId,
        isEditing: false,
      };

      dispatch(clearTask());
      return savedIntervention;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to create intervention",
      );
    }
  },
);

export { createInterventionThunk };
