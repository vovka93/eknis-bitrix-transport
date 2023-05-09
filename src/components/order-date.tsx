import { useState, useEffect, useContext } from "react";
import TextField from "@mui/material/TextField";
import InputBase from "@mui/material/InputBase";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import uaLocale from "date-fns/locale/uk";
import { DataContext } from "../dataContext";
import Field from "./field";

function getPrintDate(textDate: string) {
  const date = new Date(textDate);
  return date
    .toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    })
    .replace(",", "");
}

export default function OrderDate(props: {
  label: string;
  disabled?: boolean;
  multiline?: boolean;
  value: Date | string | null | undefined;
  ampm?: boolean;
  disableChange?: boolean;
  disablePast: boolean;
  onChange?: (e: Date | null | undefined) => void;
}) {
  const { viewMode } = useContext(DataContext);
  const [textDate, setTextDate] = useState(props.value);

  return viewMode == true ? (
    <Field label={props.label} value={getPrintDate(textDate as string)} />
  ) : (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uaLocale}>
      <DateTimePicker
        value={props.value}
        label={props.label}
        disabled={props?.disabled}
        onChange={(e) => {
          if (!props.disableChange)
            if (props.onChange && !Boolean(viewMode)) {
              props.onChange(e as Date);
            }
        }}
        renderInput={(params) => (
          <TextField {...params} size="small" variant="standard" fullWidth />
        )}
        disablePast={props.disablePast}
        ampm={false}
      />
    </LocalizationProvider>
  );
}
