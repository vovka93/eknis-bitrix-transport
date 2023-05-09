import { useEffect, useState, useContext, useRef } from "react";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridEventListener,
  GridRenderCellParams,
  GridValueGetterParams,
  ukUA,
} from "@mui/x-data-grid";
import bitrix from "./../bitrixContext";
import { DataContext } from "../dataContext";
import { BitrixUser, Order } from "../types";
import Centered from "./centered";
import { Box, CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import Dialog from "./dialog";
import { FieldKeys, FieldNames, filters, ignoreList } from "../consts";
import { darken, lighten, styled } from "@mui/material/styles";

const itemsCount = 100;

const getBackgroundColor = (color: string, mode: string) =>
  mode === "dark" ? darken(color, 0.7) : lighten(color, 0.7);

const getHoverBackgroundColor = (color: string, mode: string) =>
  mode === "dark" ? darken(color, 0.6) : lighten(color, 0.6);

const getSelectedBackgroundColor = (color: string, mode: string) =>
  mode === "dark" ? darken(color, 0.5) : lighten(color, 0.5);

const getSelectedHoverBackgroundColor = (color: string, mode: string) =>
  mode === "dark" ? darken(color, 0.4) : lighten(color, 0.4);

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .row--isUrgent": {
    backgroundColor: getBackgroundColor(
      theme.palette.error.main,
      theme.palette.mode
    ),
    "&:hover": {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.error.main,
        theme.palette.mode
      ),
    },
    "&.Mui-selected": {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.error.main,
        theme.palette.mode
      ),
      "&:hover": {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.error.main,
          theme.palette.mode
        ),
      },
    },
  },
  "& .row--fail": {
    backgroundColor: getBackgroundColor(
      theme.palette.primary.main,
      theme.palette.mode
    ),
    "&:hover": {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.primary.main,
        theme.palette.mode
      ),
    },
    "&.Mui-selected": {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.primary.main,
        theme.palette.mode
      ),
      "&:hover": {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.primary.main,
          theme.palette.mode
        ),
      },
    },
  },
  "& .row--success": {
    backgroundColor: getBackgroundColor(
      theme.palette.success.main,
      theme.palette.mode
    ),
    "&:hover": {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.success.main,
        theme.palette.mode
      ),
    },
    "&.Mui-selected": {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.success.main,
        theme.palette.mode
      ),
      "&:hover": {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.success.main,
          theme.palette.mode
        ),
      },
    },
  },
  "& .row--client": {
    backgroundColor: getBackgroundColor(
      theme.palette.warning.main,
      theme.palette.mode
    ),
    "&:hover": {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.warning.main,
        theme.palette.mode
      ),
    },
    "&.Mui-selected": {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.warning.main,
        theme.palette.mode
      ),
      "&:hover": {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.warning.main,
          theme.palette.mode
        ),
      },
    },
  },
}));

const options = ["Всі", "Мої", "Активні", "Архів"];

const sorting: string[] = [
  "uid",
  "stageId",
  "orderType",
  "author",
  "createdAt",
  "completeTo",
  "comment",
  "driver",
  "car",
  "driverComment",
];

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

export default function DataTable(props: {
  onView: (orderID: number) => void;
  tabIndex: number;
  setTabIndex: React.Dispatch<React.SetStateAction<number>>;
  user: BitrixUser;
}) {
  const { users, fields, contacts, companies, cars, statusList } =
    useContext(DataContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      id: true,
      ufCrm24_1675071973: true,
    });
  const handleEvent: GridEventListener<"rowClick"> = (
    params, // GridRowParams
    event, // MuiEvent<React.MouseEvent<HTMLElement>>
    details // GridCallbackDetails
  ) => {
    props.onView(params.row.id as number);
  };

  const orderList = (filter: any) => {
    return bitrix.getAll("order", filter);
  };

  useEffect(() => {
    let filter: any = filters["all"];
    switch (props.tabIndex) {
      case 1:
        filter = filters.my(props.user.ID);
        break;
      case 2:
        filter = filters["allActive"];
        break;
      case 3:
        filter = filters["archive"];
        break;
    }
    orderList(filter).then((orders) => {
      if (props.tabIndex == 1) {
        orderList(filters.cretedBy(props.user.ID)).then((createdOrders) => {
          if (!rowCount) {
            setRowCount(orders.length + createdOrders.length);
          }
          setIsLoaded(true);
          const filtered = [
            ...new Map(
              [...createdOrders, ...orders].map((item) => [item.id, item])
            ).values(),
          ];
          setRows(filtered);
        });
      } else {
        if (!rowCount) {
          setRowCount(orders.length);
        }
        setIsLoaded(true);
        setRows(orders);
      }
    });
  }, [props.tabIndex]);

  useEffect(() => {
    if (rows.length && !columns.length) {
      if (!columns.length) {
        let allColumns: GridColDef[] = [];
        Object.keys(fields).forEach(function (key, index) {
          if (ignoreList.includes(key)) return;
          let field = fields[key];
          let column: GridColDef = {
            field: key,
            headerName: field.title,
            width: 150,
            sortable: true,
          };
          if (key == "id") {
            column.width = 100;
            column.hideable = false;
            column.sortable = true;
          }

          if (column.headerName == "Created on") {
            column.headerName = "Дата створення";
          }
          if (column.headerName == "Created by") {
            column.headerName = "Хто створив";
          }
          if (column.headerName == "Stage") {
            column.headerName = "Стадія";
          }
          if (field.title.length >= 10) {
            column.width = 200;
          }
          if (FieldKeys[key] == "uid") {
            column.width = 120;
            column.hideable = false;
          }
          if (field.type == "crm_status") {
            if (field.statusType == "DYNAMIC_137_STAGE_24") {
              column.valueGetter = (params: GridValueGetterParams) => {
                let filtered = statusList.filter(
                  (status: any) => status.ID == params.row[key]
                );
                return filtered[0]?.VALUE || "";
              };
            }
          }
          if (field.type == "enumeration") {
            column.valueGetter = (params: GridValueGetterParams) => {
              let filtered = field["items"].filter(
                (item: { ID: string; VALUE: string }) =>
                  item.ID == params.row[key]
              );
              return filtered[0]?.VALUE || "";
            };
          }
          if (field.type == "boolean") {
            column.valueGetter = (params: GridValueGetterParams) => {
              if (params.row[key] == 1) {
                return "Так";
              }
              return "Ні";
            };
          }
          if (field.type == "crm") {
            if (field.settings.CONTACT == "Y") {
              column.valueGetter = (params: GridValueGetterParams) => {
                if (params.row[key]) {
                  let filtered = contacts.filter(
                    (contact: any) => contact.id == params.row[key]
                  );
                  return filtered[0]?.label || "";
                }
                return "";
              };
            }
            if (field.settings.DYNAMIC_166 == "Y") {
              column.valueGetter = (params: GridValueGetterParams) => {
                if (params.row[key]) {
                  let filtered = cars.filter(
                    (car: any) => car.id == params.row[key]
                  );
                  return filtered[0]?.label || "";
                }
                return "";
              };
            }
            if (field.settings.COMPANY == "Y") {
              column.valueGetter = (params: GridValueGetterParams) => {
                if (params.row[key]) {
                  let filtered = companies.filter(
                    (company: any) => company.id == params.row[key]
                  );
                  return filtered[0]?.label || "";
                }
                return "";
              };
            }
          }
          if (field.type == "user" || field.type == "employee") {
            column.valueGetter = (params: GridValueGetterParams) => {
              if (params.row[key]) {
                let filtered = users.filter(
                  (user: any) => user.id == params.row[key]
                );
                return filtered[0]?.label || "";
              }
              return "";
            };
          }
          if (field.type == "file") {
            column.valueGetter = (params: GridValueGetterParams) => {
              if (params.row[key] && params.row[key].length) {
                return params.row[key][0].urlMachine;
              }
              return "";
            };
            column.renderCell = (params: GridRenderCellParams<string>) =>
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
              );
            column.minWidth = 250;
          }
          if (field.type == "datetime") {
            column.valueGetter = (params: GridValueGetterParams) => {
              if (params.row[key]) {
                const date = new Date(params.row[key]);
                return date
                  .toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                  .replace(",", "");
              } else {
                return "";
              }
            };
          }
          allColumns.push(column);
        });
        let isUidCol = (col: any) => col.field == "ufCrm24_1675071973";
        let uidCol = allColumns.find(isUidCol);
        let uidColIndex = allColumns.findIndex(isUidCol);
        allColumns = allColumns
          .slice(0, uidColIndex)
          .concat(allColumns.slice(uidColIndex + 1));
        allColumns.splice(0, 1, uidCol as any);
        allColumns = allColumns.filter((a) => {
          if (a.field) {
            if (FieldKeys[a.field]) {
              return sorting.indexOf(FieldKeys[a.field]) != -1;
            }
            return false;
          }
        });
        allColumns.sort((a, b) => {
          const aF = FieldKeys[a.field];
          const bF = FieldKeys[b.field];
          if (aF && bF) {
            console.log(aF + " " + bF);
            if (sorting.indexOf(aF) < sorting.indexOf(bF)) {
              console.log("-1");
              return -1;
            }
            console.log("1");
            return 1;
          }
          console.log("0");
          return 0;
        });
        setColumns([...columns, ...allColumns]);
        let localColumnVisibilityModel = localStorage.getItem(
          "columnVisibilityModel"
        );
        if (localColumnVisibilityModel) {
          setColumnVisibilityModel(JSON.parse(localColumnVisibilityModel));
        }
      }
    }
  }, [rows.length]);

  return (
    <>
      {!isLoaded ? (
        <Centered>
          <CircularProgress />
        </Centered>
      ) : (
        <>
          <div style={{ height: "94vh", width: "100%" }}>
            <Box m={1}>
              <ColorToggleButton
                tabIndex={props.tabIndex}
                setTabIndex={props.setTabIndex}
              />
            </Box>
            <StyledDataGrid
              getRowClassName={(params) => {
                if (params.row["stageId"] == "DT137_24:SUCCESS") {
                  return "row--success";
                }
                if (params.row["stageId"] == "DT137_24:FAIL") {
                  return "row--fail";
                }
                if (params.row["stageId"] == "DT137_24:CLIENT") {
                  return "row--client";
                }
                return params.row[FieldNames.isUrgent as string]
                  ? "row--isUrgent"
                  : "";
              }}
              localeText={ukUA.components.MuiDataGrid.defaultProps.localeText}
              onRowClick={handleEvent}
              rows={rows}
              getRowId={(row) => row.id}
              sx={{ border: "0" }}
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              pageSize={itemsCount}
              rowCount={rowCount}
              rowsPerPageOptions={[itemsCount]}
              disableColumnFilter={true}
              disableDensitySelector={true}
              disableSelectionOnClick={true}
              initialState={{
                sorting: {
                  sortModel: [{ field: "id", sort: "asc" }],
                },
              }}
              onColumnVisibilityModelChange={(newModel) => {
                localStorage.setItem(
                  "columnVisibilityModel",
                  JSON.stringify(newModel)
                );
                setColumnVisibilityModel(newModel);
              }}
            />
          </div>
          <Dialog
            imageUrl={imageUrl}
            onClose={() => {
              setImageUrl("");
            }}
          />
        </>
      )}
    </>
  );
}
