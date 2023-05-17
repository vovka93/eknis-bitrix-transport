/// <reference path="./types.ts" />
import { useState, useEffect } from "react";
import "./App.scss";
import AppTopHeader from "./components/app-top-header";
import StartScreen from "./components/start-screen";
import Form from "./components/form";
import DataTable from "./components/data-table";
import { Order, StageRecord, BitrixUser, UserType } from "./types";
import bitrix from "./bitrixContext";
import { DataContext } from "./dataContext";
import CircularProgress from "@mui/material/CircularProgress";
import Centered from "./components/centered";
import Notification from "./components/notification";
import Lost from "./components/lost";
import { loadFromStorage } from "./functions";
import { FieldNames, reqFields } from "./consts";

export default function App() {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState<BitrixUser | undefined>();
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [fixed, setFixed] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showLost, setShowLost] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [fields, setFields] = useState<undefined | any>(undefined);
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [roles, setRoles] = useState<undefined | any>(undefined);
  const [viewMode, setViewMode] = useState(false);
  const [statusList, setStatusList] = useState<StageRecord[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [notificationProps, setNotificationProps] = useState<{
    isOpen: boolean;
    text: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    text: "",
    type: "success",
  });

  function validateOrder(order: Order): Promise<string | boolean> {
    return new Promise((resolve, reject) => {
      if (order["orderType"]) {
        let req = reqFields[order["orderType"]];
        if (req) {
          req.map((field) => {
            if (!order[field]) {
              const fName = FieldNames[field];
              if (fName) {
                reject(fields[fName].title);
              } else {
                reject("Помилка!");
              }
            }
          });
          if (order["receiverType"] == "832") {
            if (!order["receiverName"]) {
              const fName = FieldNames["receiverName"];
              if (fName) {
                reject(fields[fName].title);
              }
            }
          }
          if (order["receiverType"] == "834") {
            if (!order["company1"]) {
              const fName = FieldNames["company1"];
              if (fName) {
                reject(fields[fName].title);
              }
            }
          }
        }
      }
      resolve(true);
    });
  }

  const handleBack = () => {
    if (order) {
      setShowTable(true);
    } else {
      setShowStartScreen(true);
    }
    setOrder(undefined);
    setViewMode(false);
  };

  const handleOpen = () => {
    setFixed(false);
  };

  const handleCreating = () => {
    setShowForm(true);
  };

  const handleView = (type: number) => {
    setTabIndex(type);
    setShowTable(true);
  };

  const handleLost = () => {
    setShowLost(true);
  };

  const handleViewOrder = (orderID: number) => {
    bitrix.getOrder(orderID, fields).then((order) => {
      setOrder(order);
      setShowForm(true);
    });
  };

  const handleCreateOrder = (newOrder: Order): Promise<Order | undefined> => {
    return new Promise((resolve, reject) => {
      validateOrder(newOrder).then(
        () => {
          bitrix.counter().then((counter) => {
            let uid = counter;
            if ((window as any).BX24) {
              newOrder = { ...newOrder, uid };
            }
            bitrix.newOrder(newOrder, fields).then((data) => {
              if ("result" in data && "item" in data["result"]) {
                // if ((window as any).BX24 && uid) {
                //   let Bitrix24 = (window as any).BX24;
                //   Bitrix24.appOption.set("ID", uid);
                // }
                let convertedOrder = bitrix.convertOrder(
                  data["result"]["item"],
                  true,
                  fields
                );
                // setShowStartScreen(true);
                bitrix.counterSet(uid + 1);
                handleSuccess("Заяка створена");
                resolve({ ...newOrder, ...convertedOrder });
              } else {
                handleError("Фатальна помилка.");
              }
            });
          });
        },
        (fieldName) => {
          handleError(`Не заповнене поле "${fieldName}"`);
          reject(false);
        }
      );
    });
  };

  const handleUpdate = (order: Order): Promise<Order | undefined> => {
    return new Promise((resolve) => {
      bitrix.updateOrder(order, fields).then(() => {
        bitrix.updateFields(order.id as number).then((data) => {
          bitrix.getOrder(order.id as number, fields).then((order) => {
            handleSuccess("Успішно");
            resolve(order);
          });
        });
      });
    });
  };

  const handleDelete = () => {
    if (order?.id) {
      bitrix.deleteOrder(order.id).then(() => {
        setNotificationProps({
          ...notificationProps,
          isOpen: true,
          text: "Заявка видалена",
        });
        setShowTable(true);
      });
    }
  };

  const handleError = (text: string) => {
    setNotificationProps({ isOpen: true, type: "error", text });
  };

  const handleSuccess = (text: string) => {
    setNotificationProps({ isOpen: true, type: "success", text });
  };

  useEffect(() => {
    if ((window as any).BX24) localStorage.clear();
    loadFromStorage(
      "fields",
      () => {
        bitrix.getSmartFields().then((data) => {
          let fields = data.result.fields;
          localStorage.setItem("fields", JSON.stringify(fields));
          setFields(fields);
        });
      },
      setFields
    );
    loadFromStorage(
      "companies",
      () => {
        bitrix.getAll("company").then((companies) => {
          companies = companies.map((company) => {
            return { id: company.ID, label: company.TITLE };
          });
          localStorage.setItem("companies", JSON.stringify(companies));
          setCompanies(companies);
        });
      },
      setCompanies
    );
    loadFromStorage(
      "users",
      () => {
        bitrix.getAll("user").then((users) => {
          let drivers = users.filter(({ UF_DEPARTMENT }) =>
            UF_DEPARTMENT.includes(29)
          );
          drivers = drivers.map((user) => {
            let label = user.NAME;
            if (user?.LAST_NAME) {
              label += " " + user?.LAST_NAME;
            }
            return { id: user.ID, label };
          });
          localStorage.setItem("drivers", JSON.stringify(drivers));
          setDrivers(drivers);
          users = users.map((user) => {
            let label = user.NAME;
            if (user?.LAST_NAME) {
              label += " " + user?.LAST_NAME;
            }
            return { id: user.ID, label };
          });
          localStorage.setItem("users", JSON.stringify(users));
          setUsers(users);
        });
      },
      setUsers
    );
    loadFromStorage(
      "cars",
      () => {
        bitrix.getAll("car").then((cars) => {
          cars = cars.map((car) => {
            let label = car.title;
            return { id: String(car.id), label };
          });
          localStorage.setItem("cars", JSON.stringify(cars));
          setCars(cars);
        });
      },
      setCars
    );
    loadFromStorage(
      "statusList",
      () => {
        bitrix
          .call("crm.status.list", {
            order: { SORT: "ASC" },
            filter: { ENTITY_ID: "DYNAMIC_137_STAGE_24" },
          })
          .then((data) => {
            let result = data.result;
            result = result.map((stage: StageRecord) => {
              return { ID: stage.STATUS_ID, VALUE: stage.NAME };
            });
            localStorage.setItem("statusList", JSON.stringify(result));
            setStatusList(result);
          });
      },
      setStatusList
    );
  }, []);

  useEffect(() => {
    if (showStartScreen) {
      setShowForm(false);
      setShowTable(false);
      setShowLost(false);
      setFixed(true);
    }
  }, [showStartScreen]);

  useEffect(() => {
    if ((showForm || showTable || showLost) && showStartScreen) {
      setShowStartScreen(false);
    }
  }, [showForm, showTable, showLost]);

  useEffect(() => {
    if (showForm) {
      setShowTable(false);
      if (order) {
        setFixed(false);
      }
    }
  }, [showForm]);

  useEffect(() => {
    if (showTable) {
      setShowForm(false);
      setFixed(false);
    }
  }, [showTable]);

  useEffect(() => {
    if (showLost) {
      setFixed(false);
    }
  }, [showLost]);

  useEffect(() => {
    if (userId && !user?.ID) {
      bitrix.getUser(userId).then((data) => {
        let user: BitrixUser = {
          ...data["result"].pop(),
        };
        setUser(user);
      });
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      bitrix.rolesList().then((data) => {
        let employers = data.result.items.pop();
        let roles = {
          admins: employers["ufCrm93Admins"],
          boss: employers["ufCrm93Bosses"],
          drivers: employers["ufCrm93Drivers"],
        };
        let role: UserType = "user";
        if (roles) {
          if (roles["admins"].includes(userId)) {
            role = "admin";
          }
          if (roles["boss"].includes(userId)) {
            role = "boss";
          }
          if (roles["drivers"].includes(userId)) {
            role = "driver";
          }
          let newUser = user;
          newUser.role = role;
          setUser(newUser);
        }
        setRoles(roles);
      });
    }
  }, [user]);

  useEffect(() => {
    bitrix.profile().then((data) => {
      setUserId(data["result"]["ID"]);
    });
  }, []);

  const isLoaded =
    user &&
    users.length &&
    companies.length &&
    statusList.length &&
    roles &&
    typeof fields !== "undefined";

  return (
    <>
      {isLoaded ? (
        <>
          <AppTopHeader
            showBack={!showStartScreen}
            onBack={handleBack}
            fixed={fixed}
          />
          {showStartScreen && (
            <StartScreen
              {...{ user }}
              onCreate={handleCreating}
              onView={handleView}
              onLost={handleLost}
            />
          )}
          <DataContext.Provider
            value={{
              fields,
              companies,
              users,
              drivers,
              contacts,
              cars,
              viewMode,
              statusList,
              roles,
            }}
          >
            {showLost && <Lost {...{ user }} onCreate={handleCreateOrder} />}
            {showForm && (
              <>
                <Form
                  {...{ setViewMode }}
                  {...{ order }}
                  {...{ user }}
                  onOpen={handleOpen}
                  onClose={handleBack}
                  onCreate={handleCreateOrder}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  handleError={handleError}
                />
              </>
            )}
            {showTable && (
              <DataTable
                {...{ user }}
                {...{ tabIndex }}
                {...{ setTabIndex }}
                onView={handleViewOrder}
              />
            )}
          </DataContext.Provider>
          <Notification
            {...notificationProps}
            onClose={() => {
              setNotificationProps({ ...notificationProps, isOpen: false });
            }}
          />
        </>
      ) : (
        <Centered>
          <CircularProgress />
        </Centered>
      )}
    </>
  );
}
