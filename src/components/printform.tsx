import { ReactNode, useContext } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import { AllowedType, Order, OrderKeys } from "../types";
import { FieldNames, typeTranslation } from "../consts";
import { DataContext } from "../dataContext";
import UniversalField from "./universal-field";

function T({ children }: { children: ReactNode }) {
  return (
    <Box p={1}>
      <Typography>{children}</Typography>
    </Box>
  );
}

function PrintTables(props: { order: Order }) {
  const { fields, companies } = useContext(DataContext);
  const tableRows: { [key in AllowedType]?: OrderKeys[][] } = {
    "888": [["company1", "company2", "warehouseUkr", "ttn"], ["comment"]],
    "890": [["company2", "listType"], ["destination"], ["comment"]],
    "836": [
      ["company1", "company2", "warehouse", "ttn", "payment"],
      ["comment"],
    ],
    "838": [
      [
        "warehouse",
        "size",
        "cargoDesc",
        "company2",
        "senderPhone",
        "receiverName",
        "receiverPhone",
        "destination",
        "payer",
        "insurance",
      ],
      ["comment"],
    ],
    "840": [
      [
        "peoplesPlacement",
        "to",
        "purpose",
        "peoples",
        "bags",
        "isBack",
        "alwaysDriver",
        "driverDelay",
      ],
      ["comment"],
    ],
    "842": [["company2", "place", "to", "size"], ["comment"]],
    "844": [["company2", "place", "to", "size"], ["comment"]],
  };

  const companyTitles: {
    [key in AllowedType]?: {
      [key in OrderKeys]?: string;
    };
  } = {
    "888": {
      company1: "Компанія відправник",
      company2: "Компанія одержувач",
    },
    "890": {
      company2: "Компанія відправник",
    },
    "836": {
      company1: "Компанія відправник",
      company2: "Компанія одержувач",
    },
    "838": {
      company2: "Компанія відправник",
    },
    "842": {
      company2: "Компанія відправник",
    },
    "844": {
      company2: "Компанія відправник",
    },
  };
  const fieldUI = (name: OrderKeys) => {
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
      value: normalizedValue(props.order[name]),
      disabled: false,
    };
  };

  return (
    <>
      {tableRows[props.order.orderType as AllowedType]?.map((list, key) => {
        return (
          <Box my={4} key={key}>
            <table className="fWTable" border={1}>
              <tbody>
                {list.map((key) => {
                  let fieldName = key as string;
                  const field = fields[FieldNames[key as OrderKeys] as string];
                  let fieldValue = props.order[key] as string;
                  fieldName = field.formLabel;
                  if (field.type == "enumeration") {
                    let item = field.items.find(
                      (c: any) => c["ID"] == fieldValue
                    );
                    if (item) {
                      fieldValue = item.VALUE;
                    }
                  }
                  if (field.type == "boolean") {
                    fieldValue = fieldValue ? "Так" : "Ні";
                  }
                  let cTitles =
                    companyTitles[props.order.orderType as AllowedType];
                  if (cTitles) {
                    if (cTitles[key]) {
                      fieldName = cTitles[key] ?? "";
                      if (field.type == "crm") {
                        let company = companies.find(
                          (c: any) => c["id"] == fieldValue
                        );
                        if (company) {
                          fieldValue = company.label;
                        }
                      }
                    }
                  }
                  if (!fieldValue) return <tr key={key}></tr>;
                  return (
                    <tr key={key}>
                      <td className="lCol">
                        <T>
                          <b>{fieldName}</b>
                        </T>
                      </td>
                      <td>
                        <Box p={1}>
                          <T>{fieldValue}</T>
                        </Box>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        );
      })}
    </>
  );
}

export default function PrintForm(props: {
  order: Order;
  createdAt: string;
  completeTo: string;
  department: string;
  phoneNumber: string;
}) {
  const { users } = useContext(DataContext);
  return (
    <>
      <Container maxWidth="lg">
        <Box>
          {props.order.isUrgent && (
            <Typography variant="h5" component="b" color={"error"}>
              ТЕРМІНОВА
            </Typography>
          )}
          <Box mt={4}>
            <Typography variant="h5" component="h5" align="center">
              ТРАНСПОРТНА ЗАЯВКА №{props.order.uid}
            </Typography>
            <Typography align="center">
              «{typeTranslation[props.order.orderType as AllowedType]}»
            </Typography>
          </Box>
          <Box mt={4}>
            <table>
              <tbody>
                <tr>
                  <td>
                    <T>
                      <b>Дата створення:</b>
                    </T>
                  </td>
                  <td>
                    <T>{props.createdAt}</T>
                  </td>
                </tr>
                <tr>
                  <td>
                    <T>
                      <b>Виконати до:</b>
                    </T>
                  </td>
                  <td>
                    <T>{props.completeTo}</T>
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
          <Box my={4}>
            <table border={1}>
              <tbody>
                <tr>
                  <td>
                    <T>
                      <b>Автор заявки</b>
                    </T>
                  </td>
                  <td>
                    <T>
                      <b>Відділ</b>
                    </T>
                  </td>
                  <td>
                    <T>
                      <b>Контактний номер</b>
                    </T>
                  </td>
                </tr>
                <tr>
                  <td>
                    <T>
                      {
                        users.find((u: any) => u["id"] == props.order.author)[
                          "label"
                        ]
                      }
                    </T>
                  </td>
                  <td>
                    <T>{props.department}</T>
                  </td>
                  <td>
                    <T>{props.phoneNumber}</T>
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
          <Box>
            <PrintTables order={props.order} />
          </Box>
        </Box>
      </Container>
    </>
  );
}
