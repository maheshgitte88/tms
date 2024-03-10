import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createTicket = createAsyncThunk(
  "createNewticket",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:2000/Ticket/create-ticket",
        data
      );
      const result = response.data;
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getDepTicket = createAsyncThunk(
  "getdepTickets",
  async ({ departmentId, SubDepartmentId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `http://localhost:2000/department/${departmentId}/${SubDepartmentId}`
      );
      const resData = res.data.tickets;
      return resData;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const DepTickets = createSlice({
  name: "DepTicketDetails",
  initialState: {
    DTickets: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateDeptTicket: (state, action) => {
        state.DTickets.push(action.payload);
    },
    updateTicket: (state, action) => {
      const updatedTickets = action.payload;
      state.DTickets = updatedTickets;
    },
  }, // Use an empty `reducers` object if you don't have custom reducers
  extraReducers: (builder) => {
    builder
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.DTickets.push(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
      })
      .addCase(getDepTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDepTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.DTickets = action.payload;
      })
      .addCase(getDepTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
      });
  },
});

export const { updateDeptTicket, updateTicket } = DepTickets.actions;
export default DepTickets.reducer;
