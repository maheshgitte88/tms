import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createTicket = createAsyncThunk(
    "createNewticket",
    async (data, { rejectWithValue }) => {
        console.log("createNewticket", data);
        try {
            const response = await axios.post('http://localhost:2000/Ticket/create-ticket', data);
            const result = response.data;
            return result;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const getEmployeeTicket = createAsyncThunk(
    "getEmployeeTicket",
    async (EmpId, { rejectWithValue }) => {
        try {
            const res = await axios.get(`http://localhost:2000/Tickets/${EmpId}`);
            const resData = res.data.tickets;
            console.log(resData ,242424)
            return resData;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);




export const EmpTickets = createSlice({
    name: "EmpTicketDetails",
    initialState: {
        ETickets: [],
        loading: false,
        error: null,
    },
    reducers: {
        updateEmpTicket: (state, action) => {
            state.ETickets.push(action.payload);
        },
     }, // Use an empty `reducers` object if you don't have custom reducers
    extraReducers: (builder) => {
        builder
            .addCase(createTicket.pending, (state) => {
                state.loading = true;
            })
            .addCase(createTicket.fulfilled, (state, action) => {
                state.loading = false;
                state.ETickets.push(action.payload);
            })
            .addCase(createTicket.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
            })
            .addCase(getEmployeeTicket.pending, (state) => {
                state.loading = true;
            })
            .addCase(getEmployeeTicket.fulfilled, (state, action) => {
                state.loading = false;
                state.ETickets = action.payload;
            })
            .addCase(getEmployeeTicket.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
            });
    },
});
export const { updateEmpTicket } = EmpTickets.actions;

export default EmpTickets.reducer;