import { TextField } from "@mui/material";

export default function Field(props: {
  label: string;
  value?: unknown;
  multiline?: boolean;
}) {
  return (
    <>
      <TextField
        label={props.label}
        value={props.value}
        fullWidth
        size="small"
        variant="standard"
        multiline={props?.multiline}
        InputProps={{ disableUnderline: true }}
      />
    </>
  );
}
