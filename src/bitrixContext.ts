import { BadgeCounters, BadgeFilter, Order } from "./types";

import { FieldNames } from "./consts";

class BitrixClient {
  endpoint: string;
  static entityTypeId = 137;
  static smartID = { entityTypeId: BitrixClient.entityTypeId };
  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.orderList = this.orderList.bind(this);
    this.companyList = this.companyList.bind(this);
    this.contactList = this.contactList.bind(this);
    this.userList = this.userList.bind(this);
    this.rolesList = this.rolesList.bind(this);
    this.carList = this.carList.bind(this);
  }
  static getOrderFields(order: Order) {
    return order;
  }
  convertOrder(order: Order | any, fromBitrix: boolean, fields: any): any {
    let swapedOrder: Order | any = {};
    Object.entries(FieldNames).forEach(([key, value]) => {
      let to = value;
      let from = key;
      if (fromBitrix) {
        [to, from] = [from, to];
      }
      let newValue = order[from];
      if (newValue !== "" && newValue !== undefined) {
        if (fields[value]) {
          if (
            fields[value].type == "datetime" ||
            fields[value].type == "file"
          ) {
            swapedOrder[to] = newValue;
            return;
          }
          if (fields[value].type == "boolean") {
            swapedOrder[to] = Boolean(newValue);
          } else {
            if (newValue != null && newValue != "null") {
              swapedOrder[to] = String(newValue);
            } else {
              swapedOrder[to] = undefined;
            }
          }
        }
      }
    });
    return swapedOrder;
  }
  async call(method: string, params: any = {}) {
    try {
      let token = (window as any)?.BX24?.getAuth()["access_token"] ?? "";
      let url =
        this.endpoint +
        method +
        ".json" +
        (token ? "?access_token=" + token : "");
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json();
    } catch (error) {
      console.error("Error:", error);
    }
  }
  getFile(id: number): Promise<any> {
    return this.call("disk.file.get", { id });
  }
  updateFields(id: number) {
    let DOCUMENT_ID = [
      "crm",
      `Bitrix\\Crm\\Integration\\BizProc\\Document\\Dynamic`,
      "DYNAMIC_137_" + id,
    ];
    return this.call("bizproc.workflow.start", {
      TEMPLATE_ID: 1070,
      DOCUMENT_ID,
    });
  }
  profile(): Promise<any> {
    return this.call("profile");
  }
  getSmartFields(): Promise<any> {
    return this.call("crm.item.fields", { ...BitrixClient.smartID });
  }
  newOrder(order: Order, fields: any) {
    let convertedOrder = this.convertOrder(
      { ...order, id: undefined },
      false,
      fields
    );
    return this.call("crm.item.add", {
      ...BitrixClient.smartID,
      fields: convertedOrder,
    });
  }
  updateOrder(order: Order, fields: any) {
    let convertedOrder = this.convertOrder(
      { ...order, id: undefined },
      false,
      fields
    );
    return this.call("crm.item.update", {
      ...BitrixClient.smartID,
      id: order.id,
      fields: convertedOrder,
    });
  }
  getOrder(id: number, fields: any) {
    const convertOrder = this.convertOrder;
    return new Promise<Order>((resolve, reject) => {
      bitrix
        .call("crm.item.get", { ...BitrixClient.smartID, id })
        .then((data) => {
          if ("result" in data && "item" in data["result"]) {
            resolve(convertOrder(data["result"]["item"], true, fields));
          } else {
            reject();
          }
        });
    });
  }
  deleteOrder(id: number) {
    return this.call("crm.item.delete", { ...BitrixClient.smartID, id });
  }
  orderList(start: number = 0, filter: any = {}) {
    return this.call("crm.item.list", {
      ...BitrixClient.smartID,
      select: ["*"],
      order: {
        ID: "DESC",
      },
      filter,
      start,
    });
  }
  carList(start: number = 0) {
    return this.call("crm.item.list", {
      entityTypeId: 166,
      select: ["*"],
      order: {
        ID: "ASC",
      },
      start,
    });
  }
  companyList(start: number = 0) {
    return this.call("crm.company.list", {
      select: ["*"],
      order: {
        ID: "ASC",
      },
      start,
    });
  }
  contactList(start: number = 0) {
    return this.call("crm.contact.list", {
      select: ["*"],
      order: {
        ID: "ASC",
      },
      start,
    });
  }
  userList(start: number = 0) {
    return this.call("user.search", {
      FILTER: { USER_TYPE: "employee", ACTIVE: "Y" },
      start,
    });
  }
  rolesList() {
    return this.call("crm.item.list", {
      entityTypeId: 177,
      select: ["*"],
      filter: { ID: 1 },
      order: {
        ID: "ASC",
      },
    });
  }
  async counter() {
    const result = await this.call("crm.item.list", {
      entityTypeId: 177,
      select: ["*"],
      filter: { ID: 1 },
      order: {
        ID: "ASC",
      },
    });
    return result["result"]["items"].pop()["ufCrm93Counter"];
  }
  counterSet(ufCrm93Counter: number) {
    this.call("crm.item.update", {
      entityTypeId: 177,
      id: 1,
      fields: { ufCrm93Counter },
    });
  }
  getTotalNumbers(filters: BadgeFilter): Promise<BadgeCounters> {
    return new Promise<BadgeCounters>((resolve) => {
      let params: any = {};
      for (const key in filters) {
        if (filters.hasOwnProperty(key)) {
          params[key] = [
            "crm.item.list",
            {
              ...BitrixClient.smartID,
              select: ["ID"],
              filter: filters[key],
            },
          ];
        }
      }
      if ((window as any).BX24) {
        (window as any).BX24.callBatch(params, function (result: any) {
          let totals: BadgeCounters = {};
          for (const key in result) {
            if (result.hasOwnProperty(key)) {
              totals[key] = result[key].answer.total;
            }
          }
          resolve(totals);
        });
      }
    });
  }
  getAll(
    type: "order" | "company" | "contact" | "user" | "car",
    filter?: any
  ): Promise<any[]> {
    switch (type) {
      case "order":
        return this.all(0, this.orderList, filter);
      case "company":
        return this.all(0, this.companyList);
      case "contact":
        return this.all(0, this.contactList);
      case "user":
        return this.all(0, this.userList);
      case "car":
        return this.all(0, this.carList);
    }
  }
  all(
    start: number = 0,
    list: (start: number, filter?: any) => Promise<any>,
    filter?: any
  ): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      let data = await list(start, filter);
      if ("error" in data) {
        reject();
      } else {
        let iterable = data.result;
        if (!Array.isArray(iterable)) {
          if (data.result?.items) {
            iterable = data.result.items;
          }
        }
        resolve([
          ...iterable,
          ...(data.next ? await this.all(start + 50, list) : []),
        ]);
      }
    });
  }
  getUser(ID: string) {
    return this.call("user.get", { ID });
  }
  getDepartment(ID: string) {
    return this.call("department.get", { ID: parseInt(ID) });
  }
  newContact(contactName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let parts = contactName.split(" ");
      let fields = {
        NAME: parts[0] ?? "",
        LAST_NAME: parts[1] ?? "",
        OPENED: "Y",
        // "ASSIGNED_BY_ID": 1,
        TYPE_ID: "CLIENT",
        SOURCE_ID: "SELF",
      };
      this.call("crm.contact.add", { fields }).then((data) => {
        resolve(data.result);
      });
    });
  }
  newCompany(companyName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let fields = {
        TITLE: companyName,
        OPENED: "Y",
        // "ASSIGNED_BY_ID": 1,
        TYPE_ID: "CLIENT",
        SOURCE_ID: "SELF",
      };
      this.call("crm.company.add", { fields }).then((data) => {
        resolve(data.result);
      });
    });
  }
}

let url = "https://b24-qq9gfo.bitrix24.eu/rest/";

const bitrix = new BitrixClient((window as any).BX24 ? url : url + "");

export default bitrix;
