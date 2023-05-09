import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

export default function ConfirmDialog(props: {
  isOpen: boolean,
  title?: string,
  onAccept: (value: string) => void,
  onCancel: () => void
}) {
  const [value, setValue] = useState("");
  return (
    <Dialog
      open={props.isOpen}
      maxWidth="md"
      fullWidth
      onClose={() => { }}
    >
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Введіть текст"
          type="text"
          fullWidth
          variant="standard"
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.onCancel}
        >
          Відміна
        </Button>
        <Button
          onClick={() => {
            props.onAccept(value);
          }}
        >
          ОК
        </Button>
      </DialogActions>
    </Dialog>
  )
}