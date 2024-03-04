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

export const DepTickets = createSlice({
    name: "DepTicketDetails",
    initialState: {
        DTickets: [],
        loading: false,
        error: null,
    },
    reducers: {}, // Use an empty `reducers` object if you don't have custom reducers
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
            });
    },
});

export default DepTickets.reducer;