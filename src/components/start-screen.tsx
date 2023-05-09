import {
  MouseEventHandler,
  Reducer,
  useEffect,
  useReducer,
} from "react";
import Centered from "./centered";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Badge, Divider } from "@mui/material";
import bitrix from "../bitrixContext";
import { BitrixUser, MyBadges, BadgeFilter } from "../types";
import { filters } from "../consts";

const badgeSx = {
  width: "100%",
  "& .MuiBadge-badge": {},
};

export default function StartScreen(props: {
  user: BitrixUser;
  onCreate: MouseEventHandler<HTMLButtonElement>;
  onView: (type: number) => void;
  onLost: MouseEventHandler<HTMLButtonElement>;
}) {
  const [badges, setBadgets] = useReducer<Reducer<MyBadges, Partial<MyBadges>>>(
    (state, newState) => ({ ...state, ...newState }),
    { my: 0, active: 0, accepted: 0, archive: 0, lost: 0, cretedBy: 0 }
  );

  const BadgesFilters: BadgeFilter = {
    active: filters["active"],
    accepted: filters["accepted"],
    // my: filters.my(props.user.ID),
    // cretedBy: filters.cretedBy(props.user.ID),
    // archive: filters["archive"],
    // lost: filters["lost"],
  };

  useEffect(() => {
    if ((window as any).BX24) {
      bitrix.getTotalNumbers(BadgesFilters).then((totals) => {
        console.log(totals)
        setBadgets(totals);
      });
    }
  }, []);

  return (
    <Centered>
      <Box>
        <Typography variant="h5" component="h5">
          Виберіть дію
        </Typography>
      </Box>
      <Box mt={4}>
        <Stack
          spacing={2}
          direction="column"
          divider={<Divider orientation="vertical" flexItem />}
        >
          <Button
            variant="contained"
            color="success"
            disableElevation
            onClick={props.onCreate}
          >
            Створити заявку
          </Button>
          <Badge sx={badgeSx} badgeContent={badges.my}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disableElevation
              onClick={() => {
                props.onView(0);
              }}
            >
              Всі заявки
            </Button>
          </Badge>
          <Badge sx={badgeSx} badgeContent={badges.my}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disableElevation
              onClick={() => {
                props.onView(1);
              }}
            >
              Мої заявки
            </Button>
          </Badge>
          <Badge sx={badgeSx} badgeContent={badges.accepted} color="success">
            <Badge sx={badgeSx} badgeContent={badges.active} anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }} color="error">
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disableElevation
                onClick={() => {
                  props.onView(2);
                }}
              >
                Активні заявки
              </Button>
            </Badge>
          </Badge>
          <Badge sx={badgeSx} badgeContent={badges.archive}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disableElevation
              onClick={() => {
                props.onView(3);
              }}
            >
              Архів
            </Button>
          </Badge>
          <Badge sx={badgeSx} badgeContent={badges.lost}>
            <Button
              variant="contained"
              color="warning"
              disableElevation
              onClick={props.onLost}
            >
              Неідентифіковані отримання
            </Button>
          </Badge>
        </Stack>
      </Box>
    </Centered>
  );
}
