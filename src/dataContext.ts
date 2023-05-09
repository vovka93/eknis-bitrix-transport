import { createContext, useContext } from "react";

export const DataContext = createContext<any>({
  fields: {},
  companies: [],
  users: [],
  drivers: [],
  contacts: [],
  cars: [],
  viewMode: false,
  statusList: [],
  roles: {},
});

export const useGlobalContext = () => useContext(DataContext);
