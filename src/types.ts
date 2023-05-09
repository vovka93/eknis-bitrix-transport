import { FieldNames } from "./consts";

type InputFile = {
  fileData: {
    name: string;
    content: string;
  };
};

type BitrixFile = {
  id: number;
  url: string;
  urlMachine: string;
};

type Movement = {
  id: number; // Номер заявки
  stageId: Stage; // Стадія
  createdAt: Date; // Дата створення
  completeTo: Date | null; // Виконати до
  author: string; // Автор заявки
  company1: string; // Компанія
  company2: string; // Компанія
  orgName: string; // Назва організації доставки +
  from: string; // Адреса звідки доставити +
  to: string; // Адреса куди доставити +
  type: string; // Тип вантажу +
  size: string; // Розмір / Маса +
  comment: string; // Примітка
  isUrgent: boolean; // Термінова заявка
  bags: string; // Наявність багажу
  orderType: AllowedType; // Тип заявки
  file: InputFile | BitrixFile[]; // Файл
  com: string; // Коментар
  fileName: string; // Назва файлу
  driver: string; // Водій
  stage: string; // Стадія
  executedAt: Date; // Дата виконання
  car: string; // Номер машини
  ttn: string; // ТТН +
  warehouse: string; // Відділення +
  senderPhone: string; // Телефон відправника
  sender: string; // Відправник
  senderName: string; // Найменування відправника
  receiverPhone: string; // Телефон одержувача
  receiverType: "832" | "834"; // Одержувач
  receiverName: string; // Найменування одержувача
  destination: string; // Куди відправляти
  payment: string; // Оплата
  insurance: string; // Страхування (грн)
  index: string; // Індекс
  payer: string; // Хто сплачує доставку
  listType: string; // Тип листа
  house: string; // Будинок
  city: string; // Місто
  isBack: boolean; // Необхідність перевезення в зворотньому напрямку
  alwaysDriver: boolean; // Необхідність присутності водія на весь час заявки
  driverDelay: string; // Орієнтовний час очікування водія(годин)
  thirtyPlus: boolean; // Вага більша за 30 кг
  purpose: string; // Мета поїздки
  warehouseUkr: string; // Номер відділення Укрпошти
  peoplesPlacement: string; // Місце знаходження персоналу
  area: string; // Район
  region: string; // Область
  peoples: string; // Кількість людей
  contactPhone: string; // Контактний номер особи, що створила заявку
  lostPeaker: string; // Контактний номер особи, що створила заявку
  taked: Date | string; // Дата отримання
  place: string; // Місце знаходження відправлення
  lostSender: string; // Відправник
  driverComment: string; // Коментар від виконавця
  disallow: string; // причина відмови
  uid: string; // id+1
  cargoDesc: string; // Опис вантажу
};

export type StageRecord = {
  NAME: string;
  STATUS_ID: string;
};

export type AllowedType =
  | "836" // 'НоваПошта - Забрати відправлення'
  | "838" // 'НоваПошта - Стандартна відправка'
  | "840" // 'Персонал'
  | "842" // 'Великогабаритний вантаж'
  | "844" // 'Малогабаритний вантаж'
  | "888" // 'УкрПошта - Забрати відправлення'
  | "890" // 'УкрПошта - Стандартна відправка'
  | "989"; // Неідентифіковані

export type AllowedTypeNames = {
  [key in AllowedType]: string;
};

export type Order = Partial<Movement>;
export type OrderKeys = keyof typeof FieldNames;

export type FormState = Partial<{
  isPrint: boolean;
  isSaving: boolean;
  isSaved: boolean;
  isNew: boolean;
  isPost: boolean;
  isSend: boolean;
  isPeople: boolean;
  isRecive: boolean;
  isUkr: boolean;
  isNp: boolean;
  isCargo: boolean;
  isArch: boolean;
}>;

export type BitrixUser = {
  ID: string;
  ACTIVE: boolean;
  UF_DEPARTMENT: number[];
  role: UserType;
};

export type MyBadges = {
  my: number;
  cretedBy: number;
  active: number;
  accepted: number;
  archive: number;
  lost: number;
};

export type BadgeFilter = {
  [T in keyof MyBadges as string]: { [key: string]: string | string[] };
};

export type BadgeCounters = {
  [T in keyof MyBadges as string]: number;
};

export type FormProps = {
  order?: Order;
  user: BitrixUser;
  onOpen: () => void;
  onClose: () => void;
  onCreate: (order: Order) => Promise<Order | undefined>;
  onUpdate: (order: Order) => Promise<Order | undefined>;
  onDelete: () => void;
  setViewMode: React.Dispatch<React.SetStateAction<boolean>>;
  handleError: (text: string) => void;
};

export type ConfirmDialogProps = {
  title?: string;
  field?: string;
  isOpen: boolean;
  nextStage?: string;
};

export type UserType =
  | "admin"
  | "boss"
  | "driver"
  | "owner"
  | "executor"
  | "ownerexecutor"
  | "user";

export type Stage =
  | "EMPTY"
  | "DT137_24:NEW"
  | "DT137_24:PREPARATION"
  | "DT137_24:CLIENT"
  | "DT137_24:SUCCESS"
  | "DT137_24:FAIL";

export type OrderFieldsFlag = {
  [key in OrderKeys]?: boolean;
} & {
  "*"?: boolean;
};

export type Permission = {
  [key in Stage]?: OrderFieldsFlag;
} & {
  "*"?: OrderFieldsFlag;
};

export type Permissions = {
  [key in UserType]?: Permission;
};
