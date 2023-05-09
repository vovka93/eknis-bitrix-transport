import { MouseEventHandler } from 'react';
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AppTopHeader(props: {
  onBack: MouseEventHandler<HTMLButtonElement>;
  showBack: boolean;
  fixed: boolean;
}) {
  return (
    <AppBar position={props.fixed ? "fixed" : "static"} elevation={0} sx={{ display: 'block', displayPrint: 'none' }}>
      <Toolbar variant="dense" sx={{ "minHeight": "6vh" }}>
        {props.showBack && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={props.onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" color="inherit" component="div">
          EKNIS
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
