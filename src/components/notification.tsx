import { useEffect, useState, forwardRef } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Notification(props: {
  isOpen: boolean;
  text: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleClosePopup = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setIsPopupOpen(false);
    props.onClose();
  };

  useEffect(() => {
    setIsPopupOpen(props.isOpen);
  }, [props.isOpen]);

  return (
    <Snackbar
      open={isPopupOpen}
      autoHideDuration={2000}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      onClose={handleClosePopup}
      sx={{ displayPrint: "none" }}
    >
      <Alert severity={props.type} sx={{ width: "100%" }}>
        {props.text}
      </Alert>
    </Snackbar>
  );
}
