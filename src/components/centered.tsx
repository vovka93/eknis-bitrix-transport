import {
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
} from "react";
import Box from "@mui/material/Box";

export default function Centered(props: {
  children:
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment;
}) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      minHeight="96vh"
    >
      {props.children}
    </Box>
  );
}
