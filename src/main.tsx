import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ukUA } from "@mui/material/locale";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({}, ukUA);

function main() {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
if ((window as any).BX24) {
  (window as any).BX24.init(main);
} else {
  main();
}
