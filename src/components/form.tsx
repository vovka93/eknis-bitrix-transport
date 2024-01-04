import {
  useState,
  useEffect,
  useContext,
  useReducer,
  Reducer,
  useMemo,
  useCallback,
} from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import {
  AllowedType,
  Order,
  OrderKeys,
  FormState,
  FormProps,
  ConfirmDialogProps,
  UserType,
  Stage,
  Permission,
} from "../types";
import {
  formatDateString,
  getFileName,
  options,
  file2Base64,
  openInNewTab,
  getDepartament,
  getPhoneNumber,
  getRight,
} from "../functions";
import { typeTranslation, confirmFields, confirmTitles } from "../consts";
import OrderInput from "./order-input";
import OrderDate from "./order-date";
import OrderSelect from "./order-select";
import FormScreen from "./form-screen";
import { DataContext } from "../dataContext";
import bitrix from "../bitrixContext";
import { CircularProgress, SelectChangeEvent, TextField } from "@mui/material";
import { grey } from "@mui/material/colors";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import UniversalField from "./universal-field";
import ConfirmDialog from "./confirm-dialog";
import { userRoles, userRights } from "../consts";
import PrintForm from "./printform";

export default function Form(props: FormProps) {
  const [newOrder, setNewOrder] = useState<Order>(
    props.order ?? {
      id: 0,
      stageId: "EMPTY",
      author: props.user.ID ?? "",
    }
  );
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogProps>({
    isOpen: false,
  });
  const { viewMode, companies, users, drivers, cars, statusList } =
    useContext(DataContext);
  const [attach, setAttach] = useState<any>(false);
  const [departament, setDepartament] = useState<
    { ID: string; NAME: string } | undefined
  >();
  const [state, setState] = useReducer<Reducer<FormState, Partial<FormState>>>(
    (state, newState) => ({ ...state, ...newState }),
    {}
  );
  const [userType, setUserType] = useState<UserType>("user");
  // const prevStageId = usePrevious(newOrder.stageId);
  const [nextStageId, setNextStageID] = useState(newOrder.stageId);

  const isEditable = useCallback(
    (fieldName: OrderKeys): boolean => {
      const stageId: Stage = newOrder.stageId as Stage;
      const roleStages: Permission | undefined = userRoles[userType];
      const rightStages: Permission | undefined = userRights[props.user.role];
      let getValue = (stages: Permission | undefined): boolean => {
        let result = false;
        if (stages) {
          for (let stageKey in stages) {
            if (stageKey == stageId || stageKey == "*") {
              let stageRules = stages[stageKey as Stage];
              if (stageRules) {
                if (typeof stageRules["*"] != "undefined") {
                  result = stageRules["*"] as boolean;
                }
                if (fieldName in stageRules) {
                  result = stageRules[fieldName] as boolean;
                }
              }
            }
          }
        }
        return result;
      };
      return getValue(roleStages) || getValue(rightStages);
    },
    [newOrder.stageId, userType]
  );

  useEffect(() => {
    setUserType(getRight(props.user.ID, newOrder));
    setState({
      isNew: !Boolean(newOrder.id),
      isArch:
        newOrder.stageId == "DT137_24:FAIL" ||
        newOrder.stageId == "DT137_24:SUCCESS",
    });
  }, []);

  /// *** newOrder *** ///

  useEffect(() => {
    if (newOrder) {
      if (newOrder.file && Array.isArray(newOrder.file)) {
        if (newOrder.file.length) {
          setAttach(newOrder.file[0]);
        }
      }
    }
  }, [newOrder?.id, state.isSaving]);

  useEffect(() => {
    if (newOrder.orderType) {
      let newState = { ...options(newOrder.orderType) };
      if (newState.isPost && newState.isSend && !newOrder.insurance) {
        setNewOrder({ ...newOrder, insurance: "200" });
      }
      setState(newState);
    }
  }, [newOrder?.orderType]);

  useEffect(() => {
    if (newOrder.author) {
      getDepartament(newOrder.author).then((d) => {
        setDepartament(d);
      });
      getPhoneNumber(newOrder.author).then((phoneNumber) => {
        setNewOrder({ ...newOrder, contactPhone: phoneNumber });
      });
    } else {
      setDepartament(undefined);
      setNewOrder({ ...newOrder, contactPhone: undefined });
    }
  }, [newOrder.author]);

  useEffect(() => {
    if (newOrder.receiverType) {
      if (newOrder.receiverType === "832") {
        setNewOrder({ ...newOrder, company1: undefined });
      }
      if (newOrder.receiverType === "834") {
        setNewOrder({ ...newOrder, receiverName: undefined });
      }
    }
  }, [newOrder.receiverType]);

  useEffect(() => {
    if (!state.isNew) return;
    let phones: Record<string, string> = {
      "828": "+380673372153",
      "830": "+380678358122",
      "987": "+380682284535",
      "1197": "+380934470416",
    };
    if (state.isPost) {
      if (newOrder.company2) {
        let phone = undefined;
        if (phones.hasOwnProperty(newOrder.company2)) {
          phone = phones[newOrder.company2];
        }
        let keyName = state.isSend ? "senderPhone" : "receiverPhone";
        setNewOrder({
          ...newOrder,
          [keyName]: phone,
        });
      }
    }
  }, [newOrder?.company2]);

  useEffect(() => {
    if (newOrder?.receiverType == "834" && newOrder?.company1) {
      bitrix.getEdrpou(newOrder.company1).then((edrpou) => {
        setNewOrder({
          ...newOrder,
          edrpou,
        });
      }).catch(() => {
        setNewOrder({
          ...newOrder,
          'edrpou': '',
        });
      })
    }
  }, [newOrder?.company1, newOrder?.receiverType]);

  useEffect(() => {
    if (newOrder.sender) {
      let val = newOrder.sender;
      let newUniversalFields: Order = {
        sender: val,
      };
      let phoneA = "+380673372153";
      let phoneB = "+380678358122";
      if (val == "828") {
        newUniversalFields.senderPhone = phoneA;
      } else {
        if (val == "830") {
          newUniversalFields.senderPhone = phoneB;
        } else {
          if (
            newOrder.senderPhone == phoneA ||
            newOrder.senderPhone == phoneB
          ) {
            newUniversalFields.senderPhone = "";
          }
        }
      }
      setNewOrder({ ...newOrder, ...newUniversalFields });
    }
  }, [newOrder?.sender]);
  /// *** newOrder *** ///

  /// *** state *** ///
  useEffect(() => {
    if (state.isPrint) {
      props.setViewMode(true);
    }
  }, [state.isPrint]);

  useEffect(() => {
    if (state.isPrint && viewMode && !state.isSaving) {
      setTimeout(() => {
        setState({ isPrint: false });
        window.print();
      }, 200);
    }
  }, [state.isPrint, state.isSaving, viewMode]);

  useEffect(() => {
    if (state.isSaving) {
      if (state.isNew) {
        createOrder().then(
          (order: Order | undefined) => {
            if (order) {
              if (!state.isPrint) {
                props.onClose();
              }
              setNewOrder(order);
              setState({ isSaving: false, isNew: false });
            }
          },
          (failed) => {
            setState({ isSaving: false });
          }
        );
      } else {
        if (props.user.role != "admin") {
          if (nextStageId) {
            let requiredField = confirmFields[nextStageId];
            if (requiredField && !newOrder[requiredField]) {
              setConfirmDialog({
                ...confirmDialog,
                isOpen: true,
                title: confirmTitles[nextStageId],
                field: confirmFields[nextStageId],
              });
              setState({ isSaving: false });
              return;
            }
            if (nextStageId != "DT137_24:NEW" && !newOrder.driver) {
              props.handleError('Поле "Водій" обов\'язкове');
              setState({ isSaving: false });
              return;
            }
            if (nextStageId == "DT137_24:NEW" && newOrder.driver) {
              if (userType != "owner") {
                if (userType != "ownerexecutor") {
                  props.handleError('Поле "Стадія" обов\'язкове');
                  setState({ isSaving: false });
                  return;
                }
              }
            }
            if (nextStageId == "DT137_24:FAIL" && userType == "executor") {
              props.handleError(
                "Заборонено скасовувати! Зверніться до керівника!"
              );
              setState({ isSaving: false });
              return;
            }
            if (
              nextStageId == "DT137_24:SUCCESS" &&
              newOrder.driver &&
              newOrder.stageId == "DT137_24:NEW" &&
              !state.isNp
            ) {
              props.handleError("Оберіть правильну стадію");
              setState({ isSaving: false });
              return;
            }
            if (
              nextStageId != "DT137_24:NEW" &&
              newOrder.stageId == "DT137_24:CLIENT"
            ) {
              props.handleError("Оберіть правильну стадію");
              setState({ isSaving: false });
              return;
            }
          }
        }
        props
          .onUpdate({
            ...newOrder,
            stageId: nextStageId,
            fileName: undefined,
          })
          .then((order: Order | undefined) => {
            if (order) {
              setNewOrder(order);
              setState({ isSaving: false });
            }
          });
      }
    }
  }, [state.isSaving]);
  /// *** state *** ///

  const handleFormOpen = (orderType: AllowedType) => {
    let completeTo = new Date();
    completeTo.setMinutes(0);
    completeTo.setHours(17);
    let defaultOrder: Order = {
      completeTo,
      orderType,
    };
    setNewOrder({
      ...newOrder,
      ...defaultOrder,
    });
    props.onOpen();
  };

  const handleChange = (order: Order) => {
    setNewOrder({ ...newOrder, ...order });
  };

  const handlePrint = () => {
    setState({ isPrint: true });
  };

  const createOrder = () => {
    return props.onCreate(newOrder);
  };

  const handleCreate = (print: boolean = false) => {
    setState({ isSaving: true, isPrint: print });
  };

  const handleUpdate = () => {
    setState({ isSaving: true });
  };

  const handleNewContact = (contactName: string): Promise<number> => {
    return bitrix.newContact(contactName);
  };

  const handleNewCompany = (companyName: string): Promise<number> => {
    return bitrix.newCompany(companyName);
  };

  const handleStatusChange = (e: SelectChangeEvent<any>) => {
    setNextStageID(e.target.value);
  };

  const defaultOptions = {
    onChange: handleChange,
  };

  const field = (name: OrderKeys) => {
    const normalizedValue = (val: any): string | boolean | undefined => {
      if (typeof val === "undefined") {
        return;
      } else {
        if (typeof val === "boolean") {
          return Boolean(val);
        }
        return String(val);
      }
    };
    return {
      name,
      value: normalizedValue(newOrder[name]),
      disabled: !isEditable(name),
      ...defaultOptions,
    };
  };

  return (
    <>
      {!props.order && !newOrder.orderType ? (
        <FormScreen onFormOpen={handleFormOpen} />
      ) : newOrder.orderType ? (
        <Container maxWidth="xl">
          {(!viewMode || state.isSaving) && (
            <Box mt={4}>
              <Box my={2}>
                <Typography variant="h5">
                  {typeTranslation[newOrder.orderType as AllowedType]}{" "}
                  <UniversalField {...field("isUrgent")} />
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={9}>
                  <Grid container spacing={2}>
                    <Grid item xs={3} md={4}>
                      <UniversalField
                        label="Номер заявки"
                        viewMode={true}
                        {...field("uid")}
                      />
                    </Grid>
                    <Grid item xs={3} md={4}>
                      <UniversalField
                        name="createdAt"
                        label="Дата створення"
                        value={
                          newOrder?.createdAt
                            ? formatDateString(String(newOrder?.createdAt))
                            : "—"
                        }
                        viewMode={true}
                        disabled={!isEditable("createdAt")}
                        {...defaultOptions}
                      />
                    </Grid>
                    <Grid item xs={3} md={4}>
                      <OrderDate
                        value={newOrder?.completeTo}
                        label="Виконати до"
                        disabled={!isEditable("completeTo")}
                        disablePast={isEditable("completeTo")}
                        onChange={(dateTime) => {
                          if (!viewMode) {
                            setNewOrder({
                              ...newOrder,
                              completeTo: dateTime,
                            });
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} md={6} lg={4}>
                      <UniversalField
                        type="user"
                        name="author"
                        value={newOrder.author}
                        options={users}
                        disabled={!isEditable("author")}
                        {...defaultOptions}
                      />
                    </Grid>
                    <Grid item xs={6} md={6} lg={4}>
                      <OrderInput
                        label="Відділ"
                        name="departament"
                        value={departament?.NAME || "—"}
                        disabled={true}
                        viewMode={true}
                      />
                    </Grid>
                    <Grid item xs={6} md={6} lg={4}>
                      <UniversalField
                        name="contactPhone"
                        value={newOrder.contactPhone ?? "—"}
                        viewMode={true}
                        disabled={!isEditable("contactPhone")}
                        {...defaultOptions}
                      />
                    </Grid>
                    {state.isPost ? (
                      <>
                        {state.isUkr ? (
                          <>
                            {state.isRecive ? (
                              <></>
                            ) : (
                              <>
                                <Grid item xs={12} lg={4}>
                                  <UniversalField {...field("listType")} />
                                </Grid>
                                <Grid item xs={12} lg={4}>
                                  <UniversalField {...field("index")} />
                                </Grid>
                                <Grid item xs={12} lg={4}>
                                  <UniversalField {...field("region")} />
                                </Grid>
                                <Grid item xs={12} lg={4}>
                                  <UniversalField {...field("house")} />
                                </Grid>
                                <Grid item xs={12} lg={4}>
                                  <UniversalField {...field("city")} />
                                </Grid>
                                <Grid item xs={12} lg={4}>
                                  <UniversalField {...field("area")} />
                                </Grid>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {/* NP */}

                            {state.isRecive ? (
                              <></>
                            ) : (
                              <>
                                <Grid item xs={6} lg={4}>
                                  <UniversalField {...field("type")} />
                                </Grid>
                                <Grid item xs={6} lg={4}>
                                  <UniversalField {...field("cargoDesc")} />
                                </Grid>
                                <Grid item xs={6} lg={4}>
                                  <UniversalField {...field("size")} />
                                </Grid>
                              </>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {state.isCargo ? (
                          <>
                            <Grid item xs={12}>
                              <UniversalField {...field("from")} />
                            </Grid>
                            <Grid item xs={6} lg={4}>
                              <UniversalField {...field("size")} />
                            </Grid>
                          </>
                        ) : (
                          <>
                            {/* Peoples */}
                            <Grid item xs={12}>
                              <UniversalField {...field("peoplesPlacement")} />
                            </Grid>
                            <Grid item xs={6} lg={4}>
                              <UniversalField {...field("peoples")} />
                            </Grid>
                            <Grid item xs={6} lg={4}>
                              <UniversalField {...field("bags")} />
                            </Grid>
                            <Grid item xs={12}>
                              <UniversalField {...field("purpose")} />
                            </Grid>
                            <Grid item xs={12}>
                              <UniversalField {...field("isBack")} />
                            </Grid>
                            <Grid item xs={12}>
                              <UniversalField {...field("alwaysDriver")} />
                            </Grid>
                            {newOrder.alwaysDriver == true && (
                              <Grid item xs={4}>
                                <UniversalField {...field("driverDelay")} />
                              </Grid>
                            )}
                          </>
                        )}
                        <Grid item xs={12}>
                          <UniversalField {...field("to")} />
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12}>
                      <UniversalField {...field("comment")} multiline={true} />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Grid container spacing={2}>
                    {state.isPost ? (
                      <>
                        {state.isRecive ? (
                          <>
                            <Grid item xs={12}>
                              <UniversalField
                                label="Компанія відправник"
                                value={newOrder.company1}
                                name="company1"
                                type="company"
                                options={companies}
                                onCreate={handleNewCompany}
                                disabled={!isEditable("company1")}
                                {...defaultOptions}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <UniversalField
                                label="Компанія одержувач"
                                value={newOrder.company2}
                                name="company2"
                                type="company"
                                options={companies}
                                disabled={!isEditable("company2")}
                                {...defaultOptions}
                              />
                            </Grid>
                            {/* <Grid item xs={6} md={12}>
                            <UniversalField
                              type="phone"
                              {...field("receiverPhone")}
                              value={newOrder.receiverPhone || "+380"}
                            />
                          </Grid> */}
                            {state.isUkr ? (
                              <>
                                <Grid item xs={6} lg={12}>
                                  <UniversalField {...field("warehouseUkr")} />
                                </Grid>
                              </>
                            ) : (
                              <>
                                <Grid item xs={6} lg={12}>
                                  <UniversalField {...field("warehouse")} />
                                </Grid>
                                <Grid item xs={6} md={12}>
                                  <UniversalField {...field("payment")} />
                                </Grid>
                              </>
                            )}
                            <Grid item xs={6} lg={12}>
                              <UniversalField
                                {...field("ttn")}
                                multiline={true}
                              />
                            </Grid>
                          </>
                        ) : (
                          <>
                            <Grid item xs={12}>
                              <UniversalField
                                label="Компанія відправник"
                                name="company2"
                                type="company"
                                value={newOrder.company2}
                                options={companies}
                                disabled={!isEditable("company2")}
                                {...defaultOptions}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <UniversalField
                                type="phone"
                                {...field("senderPhone")}
                                value={newOrder.senderPhone || "+380"}
                              />
                            </Grid>
                            {state.isNp && (
                              <Grid item xs={12} lg={12}>
                                <UniversalField {...field("warehouse")} />
                              </Grid>
                            )}
                            <Grid item xs={6} md={12}>
                              <UniversalField {...field("receiverType")} />
                            </Grid>
                            {newOrder.receiverType == "832" && (
                              <Grid item xs={6} md={12}>
                                <UniversalField {...field("receiverName")} />
                              </Grid>
                            )}
                            {newOrder.receiverType == "834" && (<>
                              <Grid item xs={6} md={12}>
                                <UniversalField
                                  label="Компанія одержувач"
                                  name="company1"
                                  type="company"
                                  value={newOrder.company1}
                                  options={companies}
                                  onCreate={handleNewCompany}
                                  disabled={!isEditable("company1")}
                                  {...defaultOptions}
                                />
                              </Grid>
                              {newOrder.company1 &&
                                <Grid item xs={6} md={12}><UniversalField {...field("edrpou")} /></Grid>
                              }
                            </>
                            )}
                            <Grid item xs={6} md={12}>
                              <UniversalField
                                type="phone"
                                {...field("receiverPhone")}
                                value={newOrder.receiverPhone || "+380"}
                              />
                            </Grid>
                            {state.isNp ? (
                              <>
                                <Grid item xs={12} md={12}>
                                  <UniversalField {...field("destination")} />
                                </Grid>
                                <Grid item xs={12}>
                                  <UniversalField {...field("payer")} />
                                </Grid>
                                <Grid item xs={6} md={12} pt={0}>
                                  <UniversalField {...field("insurance")} />
                                </Grid>
                                <Grid item xs={12} md={12}>
                                  <UniversalField {...field("thirtyPlus")} />
                                </Grid>
                              </>
                            ) : (
                              <>
                                <Grid item xs={12}>
                                  <UniversalField {...field("warehouseUkr")} />
                                </Grid>
                              </>
                            )}
                            {/* <Grid item xs={6} md={12}>
                            <UniversalField
                              name="senderName"
                              type="contact"
                              options={contacts}
                              onCreate={handleNewContact}
                              {...defaultOptions}
                            />
                          </Grid> */}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {state.isCargo ? (
                          <>
                            <Grid item xs={12}>
                              <UniversalField
                                label="Компанія відправник"
                                name="company2"
                                type="company"
                                value={newOrder.company1}
                                options={companies}
                                onCreate={handleNewCompany}
                                disabled={!isEditable("company2")}
                                {...defaultOptions}
                              />
                            </Grid>
                          </>
                        ) : (
                          <></>
                        )}
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} lg={9}>
                      {!state.isNew && (
                        <Grid item xs={12}>
                          <UniversalField
                            {...field("driverComment")}
                            multiline={true}
                          />
                        </Grid>
                      )}
                    </Grid>
                    {newOrder.stageId == "DT137_24:FAIL" && (
                      <Grid item xs={12}>
                        <UniversalField
                          {...field("disallow")}
                          multiline={true}
                        />
                      </Grid>
                    )}
                    {!state.isNew && (
                      <>
                        {attach && !state.isPrint && (
                          <Grid item xs={12}>
                            <Button
                              startIcon={<AttachFileIcon />}
                              onClick={() => {
                                openInNewTab(attach.url);
                              }}
                            >
                              {getFileName(newOrder.fileName as string)}
                            </Button>
                          </Grid>
                        )}
                        {!viewMode && (
                          <Grid item xs={12}>
                            <TextField
                              name="upload-photo"
                              type="file"
                              inputProps={{ accept: "image/*" }}
                              onChange={async ({ target }: any) => {
                                let selectorFiles: FileList = target.files;
                                const file = selectorFiles.item(0);
                                if (file) {
                                  file2Base64(file).then((content) => {
                                    setNewOrder({
                                      ...newOrder,
                                      file: {
                                        fileData: { name: file.name, content },
                                      },
                                    });
                                  });
                                }
                              }}
                            />
                          </Grid>
                        )}
                        {!viewMode &&
                          !(
                            state.isUkr &&
                            state.isSend &&
                            !newOrder.isUrgent
                          ) && (
                            <>
                              <Grid item xs={6} lg={4}>
                                <UniversalField
                                  name="driver"
                                  value={newOrder.driver}
                                  isNext={newOrder.driver == "9999"}
                                  type="user"
                                  options={[
                                    ...drivers,
                                    {
                                      id: "9999",
                                      label: "Вибрати зі списку користувачів",
                                    },
                                  ]}
                                  optionsNext={users}
                                  disabled={!isEditable("driver")}
                                  onChange={handleChange}
                                />
                              </Grid>
                              <Grid item xs={6} lg={4}>
                                <UniversalField
                                  name="car"
                                  value={newOrder.car}
                                  type="car"
                                  options={cars}
                                  disabled={!isEditable("car")}
                                  onChange={handleChange}
                                />
                              </Grid>
                            </>
                          )}
                      </>
                    )}
                    <Box width="100%" />
                    {!state.isNew && !viewMode && (
                      <Grid item xs={12} lg={4}>
                        <OrderSelect
                          name="stageId"
                          label="Стадія"
                          value={nextStageId}
                          items={statusList}
                          disabled={!isEditable("stageId")}
                          onChange={handleStatusChange}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Grid>
                <Grid item>
                  <Box mt={2} sx={{ display: "block", displayPrint: "none" }}>
                    {state.isNew ? (
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          color="error"
                          disabled={state.isSaving}
                          onClick={props.onClose}
                        >
                          Відміна заявки
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={state.isSaving}
                          onClick={() => {
                            handleCreate(true);
                          }}
                        >
                          Створити та надрукувати
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={state.isSaving}
                          onClick={() => {
                            handleCreate();
                          }}
                        >
                          Створити заявку
                        </Button>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={2}>
                        {!viewMode ? (
                          <>
                            {!state.isArch && (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={handleUpdate}
                                disabled={state.isSaving}
                              >
                                {!state.isSaving || true ? (
                                  <>Зберегти</>
                                ) : (
                                  <>
                                    <CircularProgress
                                      size={24}
                                      sx={{
                                        color: grey[50],
                                      }}
                                    />
                                  </>
                                )}
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            {!state.isArch && (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                  props.setViewMode(false);
                                }}
                              >
                                Редагувати
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handlePrint}
                          disabled={state.isSaving}
                        >
                          Надрукувати
                        </Button>
                        {!viewMode && props.user.role == "admin" && (
                          <Button
                            variant="contained"
                            color="error"
                            onClick={props.onDelete}
                            disabled={state.isSaving}
                          >
                            Видалити
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          {viewMode && !state.isSaving && (
            <Box mt={4}>
              <PrintForm
                order={newOrder}
                createdAt={formatDateString(String(newOrder?.createdAt))}
                completeTo={formatDateString(String(newOrder?.completeTo))}
                department={departament?.NAME || "—"}
                phoneNumber={newOrder?.contactPhone || "—"}
              />
            </Box>
          )}
          {/* <pre>{JSON.stringify(newOrder, null, 2)}</pre> */}
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            onAccept={(value: string) => {
              if (value) {
                setNewOrder({
                  ...newOrder,
                  [confirmDialog.field as string]: value,
                });
                setConfirmDialog({
                  ...confirmDialog,
                  isOpen: false,
                });
                setState({ isSaving: true });
              } else {
                props.handleError("Поле обов'язкове для заповнення");
              }
            }}
            onCancel={() => {
              setState({ isSaving: false });
              setConfirmDialog({ ...confirmDialog, isOpen: false });
            }}
          />
        </Container>
      ) : (
        <>
          <Box m={4}>
            <Typography variant="h5" component="h5">
              Помилка
            </Typography>
          </Box>
        </>
      )}
    </>
  );
}
