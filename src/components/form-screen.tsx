import Centered from "./centered";
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { AllowedType } from "../types";

export default function FormScreen(props: {
  onFormOpen: (orderType: AllowedType) => void;
}) {
  return (
    <Centered>
      <Box mb={4}>
        <Typography variant="h5" component="h5">
          Виберіть тип заявки
        </Typography>
      </Box>
      <Grid container justifyContent="center" spacing={2}>
        {/* <Grid item sm={3}></Grid> */}
        <Grid item xs={12} xl={6} lg={8} sm={11}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box mb={1}>
                <Typography variant="h6" textAlign="center">
                  Укрпошта
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ButtonGroup
                  orientation="vertical"
                  variant="outlined"
                  aria-label="vertical outlined button group"
                  disableElevation
                >
                  <Button
                    onClick={() => {
                      props.onFormOpen("888");
                    }}
                  >
                    Отримання
                  </Button>
                  <Button
                    onClick={() => {
                      props.onFormOpen("890");
                    }}
                  >
                    Відправлення
                  </Button>
                </ButtonGroup>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box mb={1}>
                <Typography variant="h6" textAlign="center">
                  Нова пошта
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ButtonGroup
                  orientation="vertical"
                  variant="outlined"
                  aria-label="vertical outlined button group"
                  disableElevation
                >
                  <Button
                    onClick={() => {
                      props.onFormOpen("836");
                    }}
                  >
                    Отримання
                  </Button>
                  <Button
                    onClick={() => {
                      props.onFormOpen("838");
                    }}
                  >
                    Відправлення
                  </Button>
                </ButtonGroup>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box mb={1}>
                <Typography variant="h6" textAlign="center">
                  Переміщення
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ButtonGroup
                  orientation="vertical"
                  variant="outlined"
                  aria-label="vertical outlined button group"
                  disableElevation
                >
                  <Button
                    onClick={() => {
                      props.onFormOpen("840");
                    }}
                  >
                    Персонал
                  </Button>
                  <Button
                    onClick={() => {
                      props.onFormOpen("842");
                    }}
                  >
                    Великогабаритний вантаж
                  </Button>
                  <Button
                    onClick={() => {
                      props.onFormOpen("844");
                    }}
                  >
                    Малогабаритний вантаж
                  </Button>
                </ButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        {/* <Grid item sm={3}></Grid> */}
      </Grid>
    </Centered>
  );
}
