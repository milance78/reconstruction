import * as React from "react";
import "./SimpleInput.scss";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import type { InterventionField } from "../../../redux/features/newInterventionSlice";
import { updateField } from "../../../redux/features/newInterventionSlice";
interface SimpleInputProps {
  field: InterventionField;
  icon?: React.ElementType;
  label: string;
  inputType: "type1" | "type2";
}

const SimpleInput = ({ field, icon, label, inputType }: SimpleInputProps) => {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => state.newIntervention[field]);
  const Icon = icon; // JSX treats lowercase component names as HTML tags, so we need to capitalize it to use it as a React component
  return (
    <div
      className={`simple-input ${inputType === "type1" ? "type1" : "type2"}`}
    >
      <div className="icon-container">{Icon ? <Icon sx={{}} /> : null}</div>
      <FormControl >
        <TextField
          size={inputType === "type1" ? "medium" : "small"}
          fullWidth
          label={label}
          variant="outlined"
          value={typeof value === "string" ? value : ""}
          onChange={(e) =>
            dispatch(
              updateField({
                field,
                value: e.target.value,
              }),
            )
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "4px",
            },
            "& .MuiOutlinedInput-input": {
              textAlign: "center",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#bdbdbd",
              transition: "border-color 120ms ease-in-out",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#9e9e9e",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "gray",
              },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "gray",
            },
          }}
        />
      </FormControl>
    </div>
  );
};
export default SimpleInput;
