import { useState } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import TextField from "@mui/material/TextField";

import "./ClientsOnAddress.scss";
import { updateField } from "../../../redux/features/newInterventionSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/store";

const ClientsOnAddress = () => {
  const dispatch = useAppDispatch();
  const clientsOnAddress = useAppSelector(
    (state) => state.newIntervention.clientsOnAddress,
  );
  const [isFocused, setIsFocused] = useState(false);

  const updateClientsOnAddress = (value: string) => {
    dispatch(updateField({ field: "clientsOnAddress", value }));
  };

  const handleFocus = () => {
    setIsFocused(true);

    if (!clientsOnAddress.trim()) {
      updateClientsOnAddress("1. ");
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (clientsOnAddress.trim() === "1.") {
      updateClientsOnAddress("");
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateClientsOnAddress(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const textarea = event.target as HTMLTextAreaElement;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = clientsOnAddress.slice(0, cursorPosition);
    const textAfterCursor = clientsOnAddress.slice(cursorPosition);
    const currentLine = textBeforeCursor.split("\n").pop() ?? "";
    const numberedLine = currentLine.match(/^(\d+)\.\s?/);

    if (numberedLine && currentLine.trim() === `${numberedLine[1]}.`) {
      const newValue =
        textBeforeCursor.replace(/\d+\.\s?$/, "") + textAfterCursor;

      updateClientsOnAddress(newValue);

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPosition - 3;
      });
      return;
    }

    const nextNumber = numberedLine ? Number(numberedLine[1]) + 1 : 1;
    const insertedText = `\n${nextNumber}. `;
    const newValue = textBeforeCursor + insertedText + textAfterCursor;

    updateClientsOnAddress(newValue);

    requestAnimationFrame(() => {
      const newCursorPosition = cursorPosition + insertedText.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition;
    });
  };

  return (
    <TextField
      id="clients-on-address"
      label="Clients à l'adresse"
      multiline
      rows={3}
      value={clientsOnAddress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      InputLabelProps={{
        shrink: isFocused || clientsOnAddress.length > 0,
      }}
      sx={{
        width: '500px',
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: "grey !important",
          },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "grey !important",
        },
      }}
    />
  );
};

export default ClientsOnAddress;
