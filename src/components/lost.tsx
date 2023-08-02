import { useState, useEffect, useContext, useRef } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
  DataGrid,
  GridEventListener,
  GridRenderCellParams,
  GridValueGetterParams,
  ukUA,
} from "@mui/x-data-grid";
import {
  ButtonGroup,
  ClickAwayListener,
  Container,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  TextField,
} from "@mui/material";
import { BitrixUser, Order } from "../types";
import bitrix from "../bitrixContext";
import { DataContext } from "../dataContext";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import Dialog from "./dialog";
import OrderDate from "./order-date";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { file2Base64 } from "../functions";
import UniversalField from "./universal-field";

type FileType = {
  fileData: {
    name: string;
    content: string;
  };
};

const orderList = () => {
  return bitrix.getAll("order", {
    ufCrm24Ordertype: "989",
    ufCrm24_1664960635: "",
  });
};

const orderArchive = () => {
  return bitrix.getAll("order", {
    ufCrm24Ordertype: "989",
    "!ufCrm24_1664960635": "",
  });
};

const options = ["Активні", "Архів"];

function ColorToggleButton(props: {
  tabIndex: number;
  setTabIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    props.setTabIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup ref={anchorRef} aria-label="split button">
        <Button>{options[props.tabIndex]}</Button>
        <Button
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === props.tabIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default function Lost(props: {
  user: BitrixUser;
  onCreate: (order: Order) => Promise<unknown>;
}) {
  const [rows, setRows] = useState<any>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<FileType | undefined>();
  const commentRef = useRef<HTMLInputElement>();
  const placeRef = useRef<HTMLInputElement>();
  const [lostSender, setSender] = useState("");
  const [senderType, setSenderType] = useState<any>("834");
  const fileRef = useRef<HTMLInputElement>();
  const [taked, setTaked] = useState<Date | undefined>();
  const { users, companies, fields } = useContext(DataContext);
  const [tabIndex, setTabIndex] = useState(0);

  const handleClick = () => {
    if (file) {
      setIsLoading(true);
      const d = new Date();
      const takedString = taked ? taked.toISOString() : d.toISOString();
      const newOrder: Order = {
        orderType: "989",
        file,
        taked: takedString,
        comment: commentRef.current?.value ?? "",
        place: placeRef.current?.value ?? "",
        lostSender,
      };
      bitrix.counter().then((counter) => {
        let uid = counter;
        bitrix.newOrder({ ...newOrder, uid }, fields).then((createdOrder) => {
          if (createdOrder.result.item) {
            bitrix.counterSet(uid + 1);
            setIsLoading(false);
          }
          if (commentRef.current) commentRef.current.value = "";
          if (placeRef.current) placeRef.current.value = "";
          if (fileRef.current) fileRef.current.value = "";
          setTaked(undefined);
          setFile(undefined);
          loadOrders(!tabIndex);
        });
      });
    }
  };

  const loadOrders = (active: boolean) => {
    if (active)
      orderList().then((orders) => {
        setRows(orders);
      });
    else
      orderArchive().then((orders) => {
        setRows(orders);
      });
  };

  const handleNewCompany = (companyName: string): Promise<number> => {
    setSender(companyName);
    return bitrix.newCompany(companyName);
  };

  useEffect(() => {
    loadOrders(!tabIndex);
  }, [tabIndex]);

  const handleEvent: GridEventListener<"rowClick"> = (
    params, // GridRowParams
    event, // MuiEvent<React.MouseEvent<HTMLElement>>
    details // GridCallbackDetails
  ) => {
    // console.log(params.row);
  };

  const takeBtn = {
    field: "",
    headerName: "",
    disableColumnMenu: true,
    sortable: false,
    width: 100,
    renderCell: (params: GridRenderCellParams<string>) => (
      <Button
        onClick={() => {
          bitrix
            .updateOrder(
              { id: params.row.id, lostPeaker: props.user.ID },
              fields
            )
            .then(() => {
              loadOrders(!tabIndex);
            });
        }}
      >
        Забрати
      </Button>
    ),
  };

  var columns = [
    {
      field: "ufCrm24_1662466291",
      headerName: "Зображення",
      width: 150,
      // valueFormatter: ({ value }) => value[0]["url"],
      valueGetter: ({ value }: any) => value[0]["urlMachine"],
      renderCell: (params: GridRenderCellParams<string>) =>
        params.value ? (
          <a
            href="#"
            onClick={async (e) => {
              e.stopPropagation();
              setImageUrl(
                "/transport/file.php?url=" + btoa(params.value ?? "")
              );
            }}
          >
            <AttachFileIcon />
          </a>
        ) : (
          ""
        ),
    },
    { field: "ufCrm24_1675071973", headerName: "№" },
    {
      field: "createdTime",
      type: "dateTime",
      headerName: "Дата створення",
      width: 150,
      valueFormatter: ({ value }: any) =>
        value
          ?.toLocaleString([], {
            dateStyle: "short",
            timeStyle: "short",
          })
          .replace(",", ""),
      valueGetter: ({ value }: any) => value && new Date(value),
    },
    {
      field: "ufCrm24_1666692283",
      type: "dateTime",
      headerName: "Дата отримання",
      width: 150,
      valueFormatter: ({ value }: any) =>
        value
          ?.toLocaleString([], {
            dateStyle: "short",
            timeStyle: "short",
          })
          .replace(",", ""),
      valueGetter: ({ value }: any) => {
        return value && new Date(value);
      },
    },
    {
      field: "ufCrm24_1666697581",
      headerName: "Відправник",
      width: 200,
    },
    {
      field: "ufCrm24_1664960635",
      headerName: "Хто забрав посилку",
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        let filtered = users.filter(
          (user: any) => user.id == params.row['ufCrm24_1664960635']
        );
        return filtered[0]?.label || "";
      },
      sortable: false
    },
    {
      field: "ufCrm24_1662466325",
      headerName: "Коментар",
      width: 300,
    },
    {
      field: "ufCrm24_1666695378",
      headerName: "Місце знаходження відправлення",
      width: 300,
    },
  ];

  if (!tabIndex) {
    columns.unshift(takeBtn as any);
  }

  return (
    <>
      <Container maxWidth="xl">
        <Box mt={4}>
          <Box mt={2}>
            <Typography variant="h5" component="h5">
              Неідентифіковані отримання
            </Typography>
          </Box>
          <Box mt={2}>
            <Box mt={2}>
              <TextField
                name="upload-photo"
                type="file"
                disabled={isLoading}
                inputRef={fileRef}
                inputProps={{ accept: "image/*" }}
                onChange={async ({ target }: any) => {
                  let selectorFiles: FileList = target.files;
                  const file = selectorFiles.item(0);
                  if (file) {
                    file2Base64(file).then((content) => {
                      setFile({
                        fileData: { name: file.name, content },
                      });
                    });
                  } else {
                    setFile(undefined);
                  }
                }}
              />
            </Box>
            <Box mt={2}>
              <TextField
                label="Коментар"
                name="comment"
                inputRef={commentRef}
                disabled={isLoading}
                fullWidth
                multiline
              />
            </Box>
            <Box mt={2}>
              <TextField
                label="Місце знаходження відправлення"
                name="place"
                inputRef={placeRef}
                disabled={isLoading}
                fullWidth
                multiline
              />
            </Box>
            <Box mt={2}>
              <UniversalField
                label="Тип відправника"
                name="receiverType"
                value={senderType}
                onChange={val => {
                  setSender("");
                  setSenderType(val.receiverType)
                }}
              />
            </Box>
            <Box mt={2}>
              {senderType == '834' ? <UniversalField
                label="Відправник"
                name="company1"
                type="company"
                options={companies}
                onCreate={handleNewCompany}
                onChange={(val) => {
                  const id = val.company1 as string;
                  const company = companies.find((c: { id: string; label: string }) => {
                    return c.id == id;
                  });
                  setSender(company?.label ?? "");
                }}
              /> : <TextField
                label="ПІБ"
                name="lostSender"
                onChange={(e) => {
                  setSender(e.target.value);
                }}
                disabled={isLoading}
                fullWidth
                multiline
              />}
            </Box>
            <Box mt={2}>
              <OrderDate
                value={taked || null}
                label="Дата отримання"
                disabled={isLoading}
                disablePast={false}
                onChange={(dateTime) => {
                  if (dateTime) setTaked(dateTime);
                }}
              />
            </Box>
            <Box mt={2}>
              <Button
                onClick={handleClick}
                variant="contained"
                disabled={!file || isLoading || !lostSender}
              >
                Створити
              </Button>
            </Box>
            <Box my={2} mt={5}>
              <ColorToggleButton
                tabIndex={tabIndex}
                setTabIndex={setTabIndex}
              />
            </Box>
            <div style={{ height: 600, width: "100%" }}>
              <DataGrid
                onRowClick={handleEvent}
                localeText={ukUA.components.MuiDataGrid.defaultProps.localeText}
                columns={columns}
                rows={rows}
                sx={{ border: "0" }}
                pageSize={100}
                // rowCount={rowCount}
                disableColumnFilter={true}
                disableDensitySelector={true}
                disableSelectionOnClick={true}
              />
            </div>
            <Dialog
              imageUrl={imageUrl}
              onClose={() => {
                setImageUrl("");
              }}
            />
          </Box>
        </Box>
      </Container>
    </>
  );
}
