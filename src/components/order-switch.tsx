import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { useContext } from "react";
import { DataContext } from "../dataContext";

export default function OrderSwitch(props: {
  label: string;
  value: any;
  disabled?: boolean;
  onChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
}) {
  const { viewMode } = useContext(DataContext);
  const variant = props.label == "Термінова заявка" ? "h6" : "body1";
  return (
    <>
      {!viewMode ? (
        <FormControlLabel
          sx={{
            marginLeft: 0,
          }}
          control={
            <Switch
              color="primary"
              size="small"
              disabled={props?.disabled}
              checked={Boolean(props.value)}
              onChange={props.onChange}
            />
          }
          label={props.label + " "}
          labelPlacement="start"
        />
      ) : (
        <>
          {Boolean(props.value) ? (
            <Typography {...{ variant }}>
              {props.label == "Термінова заявка" ? (
                <Box sx={{ textTransform: "uppercase" }}>
                  <b>
                    <u>{props.label}</u>
                  </b>
                </Box>
              ) : (
                <u>{props.label}</u>
              )}
            </Typography>
          ) : (
            ""
          )}
        </>
      )}
    </>
  );
}
