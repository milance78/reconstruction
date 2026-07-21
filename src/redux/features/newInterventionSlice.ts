import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createInterventionThunk } from "../thunks/createInterventionThunk";

export interface Intervention {
  documentId: string;
  interventionId: string;
  network: string;
  infrastructure: string;
  oagID: string;
  na: string;
  cid: string;
  clientName: string;
  interventionDescription: string;
  clientID: string;
  mainAddress: string;
  addressDetails: string;
  clientsOnAddress: string;
  LOMKey: string;
  phone: string;
  displayAllFields: boolean;
  snowReference: string;
  isUnclear: boolean;
  isAddressConfirmed: boolean;
  isGoodExample: boolean;
  isSnow: boolean;
  comment: string;
  status: string;
  isEditing: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  dateKey?: string;
}

export type InterventionField = keyof Intervention;

interface UpdateFieldPayload {
  field: InterventionField;
  value: Intervention[InterventionField];
}

export const initialState: Intervention = {
  documentId: "",
  interventionId: "",
  network: "",
  infrastructure: "",
  oagID: "",
  na: "",
  cid: "",
  clientName: "",
  interventionDescription: "",
  clientID: "",
  mainAddress: "",
  addressDetails: "",
  clientsOnAddress: "",
  LOMKey: "",
  phone: "",
  displayAllFields: false,
  snowReference: "",
  isUnclear: false,
  isAddressConfirmed: false,
  isGoodExample: false,
  isSnow: false,
  comment: "",
  status: "",
  isEditing: false,
  createdAt: null,
  updatedAt: null,
};

const NewInterventionSlice = createSlice({
  name: "newIntervention",
  initialState,
  reducers: {
    updateField: (state, action: PayloadAction<UpdateFieldPayload>) => {
      const { field, value } = action.payload;
      (state as Record<InterventionField, Intervention[InterventionField]>)[
        field
      ] = value;
    },
    loadInterventionForEdit: (
      _state,
      action: PayloadAction<Intervention>,
    ): Intervention => ({
      ...action.payload,
      isEditing: true,
    }),
    loadDraft: (
      _state,
      action: PayloadAction<Partial<Intervention>>,
    ): Intervention => ({
      ...initialState,
      ...action.payload,
    }),
    clearTask: (): Intervention => ({
      ...initialState,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(createInterventionThunk.fulfilled, (): Intervention => {
      return {
        ...initialState,
      };
    });
  },
});

const { updateField, loadInterventionForEdit, loadDraft, clearTask } =
  NewInterventionSlice.actions;

export default NewInterventionSlice.reducer;
export {
  NewInterventionSlice,
  clearTask,
  loadDraft,
  loadInterventionForEdit,
  updateField,
};
