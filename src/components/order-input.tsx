import { ChangeEventHandler, useContext } from "react";
import TextField from "@mui/material/TextField";
import { DataContext } from "../dataContext";
import Field from "./field";

export default function OrderInput(props: {
  name?: string;
  label?: string;
  disabled?: boolean;
  multiline?: boolean;
  value: string | number | undefined;
  viewMode?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {
  const { fields, viewMode } = useContext(DataContext);
  const field = props.name ? fields[props.name] : undefined;
  const labelText = field ? field.formLabel : props.label;
  const printMode = props.viewMode || viewMode;
  return printMode ? (
    <Field label={labelText} value={props.value} multiline={props?.multiline} />
  ) : (
    <TextField
      label={labelText}
      value={props.value}
      onChange={(e) => {
        if (props.onChange && !Boolean(printMode)) {
          props.onChange(e);
        }
      }}
      variant="standard"
      size="small"
      fullWidth
      disabled={props?.disabled}
      multiline={props?.multiline}
      inputProps={{
        autoComplete: "none",
        readOnly: Boolean(printMode),
      }}
    />
  );
}
