import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";

export default (props: { imageUrl: string; onClose: () => void }) => {
  const handleClose = () => {
    props.onClose();
  };

  return (
    <Dialog onClose={handleClose} open={props.imageUrl != ""}>
      <img src={props.imageUrl} alt="" />
    </Dialog>
  );
};
