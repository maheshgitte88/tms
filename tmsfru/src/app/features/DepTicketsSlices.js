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

export const getDepResolvedTicket = createAsyncThunk(
  "getdepResTickets",
  async ({ departmentId, SubDepartmentId, EmployeeID }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `http://localhost:2000/Ticket/department/Resolved/${departmentId}/${SubDepartmentId}/${EmployeeID}`
      );
      const resData = res.data.tickets;
      return resData;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getDepClosedTicket = createAsyncThunk(
  "getdepClosedTickets",
  async ({ departmentId, SubDepartmentId, EmployeeID }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `http://localhost:2000/Ticket/department/Closed/${departmentId}/${SubDepartmentId}/${EmployeeID}`
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
    DTClosedickets: [],
    DTResolvedickets: [],
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

    StatusResTicket: (state, action) => {
      const updatedTicketStatus = action.payload;
      console.log(updatedTicketStatus);
      const { TicketId, UpdateDescription } = updatedTicketStatus;
    
      // Find the index of the ticket in state.DTickets
      const ticketIndex = state.DTickets.findIndex(ticket => ticket.TicketID === TicketId);
          
      // Check if the ticket index is found
      if (ticketIndex !== -1 && state.DTickets[ticketIndex].Status === "Resolved") {
        // Update the UpdateDescription to ResolutionDescription
        state.DTickets[ticketIndex].ResolutionDescription = UpdateDescription;
    
        // Remove the ticket from DTickets
        const removedTicket = state.DTickets.splice(ticketIndex, 1);
    
        // Add the removed ticket to DTResolvedickets
        state.DTResolvedickets.push(removedTicket[0]);
      }
    },

    updateDtTicketUpdate: (state, action) => {
      const updatedTicket = action.payload;
      const ticketIndex = state.DTickets.findIndex(ticket => ticket.TicketID === updatedTicket.TicketId);
      if (ticketIndex !== -1) {
          state.DTickets[ticketIndex].TicketUpdates.push(updatedTicket);
      }
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
      })
      .addCase(getDepClosedTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDepClosedTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.DTClosedickets = action.payload;
      })
      .addCase(getDepClosedTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
      })
      .addCase(getDepResolvedTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDepResolvedTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.DTResolvedickets = action.payload;
      })
      .addCase(getDepResolvedTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
      });
  },
});

export const { updateDeptTicket, updateTicket, updateDtTicketUpdate , StatusResTicket } = DepTickets.actions;
export default DepTickets.reducer;
