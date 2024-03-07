import { configureStore } from "@reduxjs/toolkit";
import DepTickets from './features/DepTicketsSlices'
import EmpTickets from './features/EmpTicketsSlices'
import QueryCatSubData  from "./features/QueryDataSlices";

export const store = configureStore({
  reducer: {
    app: DepTickets,
    empTickets: EmpTickets,
    QueryCatSubHierarchy:QueryCatSubData,

  },
});