import { useEffect, useState } from "react";
import "./App.scss";
import PrintForm from "./components/printform";
import bitrix from "./bitrixContext";
import { Order } from "./types";
import { formatDateString } from "./functions";

export default function App() {
  const [fields, setFields] = useState<undefined | any>(undefined);
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    bitrix.getSmartFields().then((data) => {
      setFields(data.result.fields);
    });
  }, []);

  useEffect(() => {
    if (fields) {
      bitrix.getOrder(641, fields).then((order) => {
        setOrder(order);
      });
      bitrix.getAll("company").then((companies) => {
        let list: string[] = [];
        companies = companies.map((company) => {
          list[company.ID] = company.TITLE;
        });
        setCompanies(list);
      });
    }
  }, [fields]);

  return (
    <>
      {order && (
        <PrintForm
          {...{ order }}
          createdAt={formatDateString(String(order?.createdAt))}
          completeTo={formatDateString(String(order?.completeTo))}
          department=""
          phoneNumber=""
        />
      )}
    </>
  );
}
