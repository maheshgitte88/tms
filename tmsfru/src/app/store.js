import { configureStore } from "@reduxjs/toolkit";
import DepTickets from './features/DepTicketsSlices'

export const store = configureStore({
  reducer: {
    app: DepTickets,
   },
});