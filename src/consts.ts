import {
  Order,
  AllowedTypeNames,
  Permissions,
  Stage,
  OrderKeys,
  AllowedType,
} from "./types";

export const FieldNames: { [T in keyof Order]: string } = {
  id: "id",
  stageId: "stageId",
  from: "ufCrm24From",
  to: "ufCrm24To",
  ttn: "ufCrm24Ttn",
  orgName: "ufCrm24Orgname",
  orderType: "ufCrm24Ordertype",
  createdAt: "createdTime",
  completeTo: "ufCrm24MakeFor",
  author: "ufCrm24_1661514527",
  company1: "ufCrm24_1661514544",
  company2: "ufCrm24_1661514920",
  type: "ufCrm24_1661867647",
  comment: "ufCrm24_1662466325",
  driver: "ufCrm24_1661514725",
  executedAt: "ufCrm24_1661514753",
  car: "ufCrm24_1661514810",
  isUrgent: "ufCrm24_1661514845",
  bags: "ufCrm24_1662711982",
  senderPhone: "ufCrm24_1661514899",
  senderName: "ufCrm24_1661514944",
  receiverPhone: "ufCrm24_1661514962",
  receiverType: "ufCrm24_1661514977",
  receiverName: "ufCrm24_1661515000",
  destination: "ufCrm24_1661515014",
  payment: "ufCrm24_1661515024",
  thirtyPlus: "ufCrm24_1661515088",
  insurance: "ufCrm24_1661515102",
  warehouse: "ufCrm24Warehouse",
  size: "ufCrm24Size",
  file: "ufCrm24_1662466291",
  fileName: "ufCrm24_1662543572",
  payer: "ufCrm24_1662711414",
  listType: "ufCrm24_1662711747",
  house: "ufCrm24_1662711707",
  city: "ufCrm24_1662711720",
  isBack: "ufCrm24_1662712058",
  alwaysDriver: "ufCrm24_1662712129",
  driverDelay: "ufCrm24_1662712164",
  index: "ufCrm24_1662711729",
  purpose: "ufCrm24_1663066853",
  warehouseUkr: "ufCrm24_1664279352",
  peoplesPlacement: "ufCrm24_1664279831",
  area: "ufCrm24_1664197839",
  region: "ufCrm24_1670838139",
  peoples: "ufCrm24_1662711924",
  contactPhone: "ufCrm24_1664787672",
  lostPeaker: "ufCrm24_1664960635",
  taked: "ufCrm24_1666692283",
  place: "ufCrm24_1666695378",
  lostSender: "ufCrm24_1666697581",
  driverComment: "ufCrm24_1670517558",
  disallow: "ufCrm24_1670929177",
  uid: "ufCrm24_1675071973",
  cargoDesc: "ufCrm24_1682679442",
};

export const FieldKeys = Object.fromEntries(
  Object.entries(FieldNames).map(([key, value]) => [value, key])
);

export const typeTranslation: AllowedTypeNames = {
  "836": "Нова пошта - Отримання",
  "838": "Нова пошта – Відправлення",
  "840": "Персонал",
  "842": "Великогабаритний вантаж",
  "844": "Малогабаритний вантаж",
  "888": "Укрпошта - Отримання",
  "890": "Укрпошта – Відправлення",
  989: "Неідентифіковані",
};

export const ignoreList = [
  "movedBy",
  "assignedById",
  "movedTime",
  "opened",
  "categoryId",
  "previousStageId",
  "title",
  "updatedBy",
  "updatedTime",
  "webformId",
  "xmlId",
  "ufCrm24_1662543572",
];

export const filters = {
  active: {
    stageId: ["DT137_24:NEW"],
    ufCrm24_1661514725: "",
    "!ufCrm24Ordertype": 989,
  },
  accepted: {
    stageId: ["DT137_24:PREPARATION"],
    "!ufCrm24_1661514725": "",
    "!ufCrm24Ordertype": 989,
  },
  allActive: {
    "!stageId": ["DT137_24:FAIL", "DT137_24:SUCCESS", "DT137_24:CLIENT"],
    "!ufCrm24Ordertype": 989,
  },
  all: {
    "!stageId": ["DT137_24:FAIL", "DT137_24:SUCCESS"],
    "!ufCrm24Ordertype": 989,
  },
  archive: {
    stageId: ["DT137_24:FAIL", "DT137_24:SUCCESS"],
    "!ufCrm24Ordertype": 989,
  },
  my: (id: string) => {
    return {
      "!stageId": ["DT137_24:FAIL", "DT137_24:SUCCESS"],
      ufCrm24_1680165184: id,
      "!ufCrm24Ordertype": 989,
    };
  },
  cretedBy: (id: string) => {
    return {
      "!stageId": ["DT137_24:FAIL", "DT137_24:SUCCESS"],
      "!ufCrm24Ordertype": 989,
      createdBy: id,
    };
  },
  lost: { ufCrm24Ordertype: 989, ufCrm24_1664960635: "" },
};

export const confirmFields: {
  [key in Stage]?: OrderKeys;
} = {
  "DT137_24:FAIL": "disallow",
  "DT137_24:CLIENT": "driverComment",
};

export const confirmTitles: {
  [key in Stage]?: string;
} = {
  "DT137_24:FAIL": "Вкажіть причину відмови",
  "DT137_24:CLIENT": "Вкажіть причину відправки заявки на доопрацювання",
};

const emptyFormUserPermissions = {
  EMPTY: {
    "*": true,
    id: false,
    createdAt: false,
  },
};

export const userRoles: Permissions = {
  owner: {
    EMPTY: {
      "*": true,
    },
    "DT137_24:CLIENT": {
      "*": true,
      car: false,
      driver: false,
    },
  },
  executor: {
    "*": {
      driverComment: true,
    },
    "DT137_24:NEW": {
      stageId: true,
    },
    "DT137_24:PREPARATION": {
      stageId: true,
    },
    "DT137_24:SUCCESS": {
      "*": false,
    },
    "DT137_24:FAIL": {
      "*": false,
    },
  },
  ownerexecutor: {
    "*": {
      driverComment: true,
    },
    EMPTY: {
      "*": true,
    },
    "DT137_24:NEW": {
      stageId: true,
    },
    "DT137_24:PREPARATION": {
      stageId: true,
    },
    "DT137_24:CLIENT": {
      "*": true,
      car: false,
      driver: false,
    },
    "DT137_24:SUCCESS": {
      "*": false,
    },
    "DT137_24:FAIL": {
      "*": false,
    },
  },
  user: emptyFormUserPermissions,
};

export const userRights: Permissions = {
  admin: {
    "*": {
      "*": true,
    },
    "DT137_24:SUCCESS": {
      "*": false,
    },
    "DT137_24:FAIL": {
      "*": false,
    },
  },
  boss: {
    "DT137_24:NEW": {
      stageId: true,
      driver: true,
      car: true,
    },
    "DT137_24:PREPARATION": {
      stageId: true,
      driver: true,
      car: true,
    },
  },
  driver: {
    "DT137_24:NEW": {
      stageId: true,
      driver: true,
      car: true,
    },
  },
  user: emptyFormUserPermissions,
};

/**
  Тип листа
  Індекс
  Населений пункт
  Вулиця, номер будинка 
  Тип одержувача 
  Компанія одержувач/ ПІБ одержувача
 */

export const reqFields: { [key in AllowedType]?: (keyof Order)[] } = {
  "890": ["listType", "city", "house", "receiverType", "index"],
};
