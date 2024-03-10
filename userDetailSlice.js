import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

//create action
export const createUser = createAsyncThunk(
  "createUser",
  async (data, { rejectWithValue }) => {
    console.log("data", data);
    const response = await fetch(
      "https://641dd63d945125fff3d75742.mockapi.io/crud",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//read action
export const showUser = createAsyncThunk(
  "showUser",
  async (args, { rejectWithValue }) => {
    const response = await fetch(
      "https://641dd63d945125fff3d75742.mockapi.io/crud"
    );

    try {
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
//delete action
export const deleteUser = createAsyncThunk(
  "deleteUser",
  async (id, { rejectWithValue }) => {
    const response = await fetch(
      `https://641dd63d945125fff3d75742.mockapi.io/crud/${id}`,
      { method: "DELETE" }
    );

    try {
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//update action
export const updateUser = createAsyncThunk(
  "updateUser",
  async (data, { rejectWithValue }) => {
    console.log("updated data", data);
    const response = await fetch(
      `https://641dd63d945125fff3d75742.mockapi.io/crud/${data.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const userDetail = createSlice({
  name: "userDetail",
  initialState: {
    users: [],
    loading: false,
    error: null,
    searchData: [],
  },

  reducers: {
    searchUser: (state, action) => {
      console.log(action.payload);
      state.searchData = action.payload;
    },
  },

  extraReducers: {
    [createUser.pending]: (state) => {
      state.loading = true;
    },
    [createUser.fulfilled]: (state, action) => {
      state.loading = false;
      state.users.push(action.payload);
    },
    [createUser.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    },
    [showUser.pending]: (state) => {
      state.loading = true;
    },
    [showUser.fulfilled]: (state, action) => {
      state.loading = false;
      state.users = action.payload;
    },
    [showUser.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    [deleteUser.pending]: (state) => {
      state.loading = true;
    },
    [deleteUser.fulfilled]: (state, action) => {
      state.loading = false;
      const { id } = action.payload;
      if (id) {
        state.users = state.users.filter((ele) => ele.id !== id);
      }
    },
    [deleteUser.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    [updateUser.pending]: (state) => {
      state.loading = true;
    },
    [updateUser.fulfilled]: (state, action) => {
      state.loading = false;
      state.users = state.users.map((ele) =>
        ele.id === action.payload.id ? action.payload : ele
      );
    },
    [updateUser.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    },
  },



  
});

export default userDetail.reducer;

export const { searchUser } = userDetail.actions;










io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Join the appropriate room based on TicketID
  socket.on("joinTicketRoom", (ticketId) => {
    socket.join(ticketId);
    console.log(`User ${socket.id} joined room ${ticketId}`);
  });

  // Handle ticket update event
  socket.on("ticketUpdate", async (data) => {
    console.log(data, data.TicketIDasRoomId, 57);

    try {
      const updatedTicket = await Ticket.findByIdAndUpdate(data._id, data, { new: true }); // Update existing ticket
      io.to(data.TicketIDasRoomId).emit("updatedTicketChat", updatedTicket);
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  });

  // Join department ticket room
  socket.on("joinDepaTicketRoom", (DepartmentId) => {
    socket.join(DepartmentId);
    console.log(`User ${socket.id} joined room ${DepartmentId}`);
  });

  // Handle create ticket event
  socket.on("createTicket", async (data) => {
    console.log(data, 919191);

    try {
      const newTicket = await Ticket.create(data.createTicket); // Create a new ticket

      // Option 1: Broadcast to assigned department room (assuming DepartmentId in data)
      io.to(data.AssigSubDepId).emit("updatedDeptTicketChat", newTicket);

      // Option 2: Emit to specific room based on TicketID (if stored in ticket data)
      // io.to(newTicket.TicketIDasRoomId).emit("updatedTicketChat", newTicket);

      // Respond to the client with the created ticket (optional)
      // res.status(201).json(newTicket); // Assuming you're using Express for API routes
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  });
});


{
  TicketID: 90,
  TicketType: 'OverNight',
  Status: 'Pending',
  Description: 'my Team data',
  LeadId: '',
  TicketResTimeInMinutes: 15,
  Querycategory: 'Extraa Edge',
  QuerySubcategory: 'Leads Shuffle',
  AttachmentUrl: null,
  updatedAt: 2024-03-09T20:24:52.000Z,
  createdAt: 2024-03-09T20:24:52.000Z,
  Employee: {
    EmployeeID: 6,
    EmployeeName: 'Seema Patil',
    Location: 'Baner',
    EmployeeEmail: 'seema.patil@mitsde.com',
    EmployeePassword: 'seema.patil@mitsde.com',
    createdAt: 2024-03-03T10:47:28.000Z,
    updatedAt: 2024-03-03T10:47:28.000Z,
    DepartmentID: 4,
    SubDepartmentID: 7,
    Department: Department {
      dataValues: [Object],
      _previousDataValues: [Object],
      uniqno: 1,
      _changed: Set(0) {},
      _options: [Object],
      isNewRecord: false
    },
    SubDepartment: SubDepartment {
      dataValues: [Object],
      _previousDataValues: [Object],
      uniqno: 1,
      _changed: Set(0) {},
      _options: [Object],
      isNewRecord: false
    }
  },
  Department: {
    DepartmentID: 4,
    DepartmentName: 'sales ',
    createdAt: 2024-02-29T09:28:39.000Z,
    updatedAt: 2024-02-29T09:28:39.000Z
  },
  SubDepartment: {
    SubDepartmentID: 7,
    SubDepartmentName: 'counselor',
    createdAt: 2024-02-29T09:28:41.000Z,
    updatedAt: 2024-02-29T09:28:41.000Z,
    DepartmentId: 4
  },
  AssignedDepartment: {
    DepartmentID: 1,
    DepartmentName: 'IT',
    createdAt: 2024-02-29T09:28:39.000Z,
    updatedAt: 2024-02-29T09:28:39.000Z,
    SubDepartments: [ [SubDepartment] ]
  }
} 163
{
  success: true,
  message: 'Ticket created successfully',
  ticket: {
    TicketID: 90,
    TicketType: 'OverNight',
    Status: 'Pending',
    Description: 'my Team data',
    LeadId: '',
    TicketResTimeInMinutes: 15,
    Querycategory: 'Extraa Edge',
    QuerySubcategory: 'Leads Shuffle',
    AttachmentUrl: null,
    updatedAt: 2024-03-09T20:24:52.000Z,
    createdAt: 2024-03-09T20:24:52.000Z,
    Employee: {
      EmployeeID: 6,
      EmployeeName: 'Seema Patil',
      Location: 'Baner',
      EmployeeEmail: 'seema.patil@mitsde.com',
      EmployeePassword: 'seema.patil@mitsde.com',
      createdAt: 2024-03-03T10:47:28.000Z,
      updatedAt: 2024-03-03T10:47:28.000Z,
      DepartmentID: 4,
      SubDepartmentID: 7,
      Department: [Department],
      SubDepartment: [SubDepartment]
    },
    Department: {
      DepartmentID: 4,
      DepartmentName: 'sales ',
      createdAt: 2024-02-29T09:28:39.000Z,
      updatedAt: 2024-02-29T09:28:39.000Z
    },
    SubDepartment: {
      SubDepartmentID: 7,
      SubDepartmentName: 'counselor',
      createdAt: 2024-02-29T09:28:41.000Z,
      updatedAt: 2024-02-29T09:28:41.000Z,
      DepartmentId: 4
    },
    AssignedDepartment: {
      DepartmentID: 1,
      DepartmentName: 'IT',
      createdAt: 2024-02-29T09:28:39.000Z,
      updatedAt: 2024-02-29T09:28:39.000Z,
      SubDepartments: [Array]
    }
  }
} 87
{
  TicketID: 90,
  TicketType: 'OverNight',
  Status: 'Pending',
  Description: 'my Team data',
  LeadId: '',
  TicketResTimeInMinutes: 15,
  Querycategory: 'Extraa Edge',
  QuerySubcategory: 'Leads Shuffle',
  AttachmentUrl: null,
  updatedAt: 2024-03-09T20:24:52.000Z,
  createdAt: 2024-03-09T20:24:52.000Z,
  Employee: {
    EmployeeID: 6,
    EmployeeName: 'Seema Patil',
    Location: 'Baner',
    EmployeeEmail: 'seema.patil@mitsde.com',
    EmployeePassword: 'seema.patil@mitsde.com',
    createdAt: 2024-03-03T10:47:28.000Z,
    updatedAt: 2024-03-03T10:47:28.000Z,
    DepartmentID: 4,
    SubDepartmentID: 7,
    Department: Department {
      dataValues: [Object],
      _previousDataValues: [Object],
      uniqno: 1,
      _changed: Set(0) {},
      _options: [Object],
      isNewRecord: false
    },
    SubDepartment: SubDepartment {
      dataValues: [Object],
      _previousDataValues: [Object],
      uniqno: 1,
      _changed: Set(0) {},
      _options: [Object],
      isNewRecord: false
    }
  },
  Department: {
    DepartmentID: 4,
    DepartmentName: 'sales ',
    createdAt: 2024-02-29T09:28:39.000Z,
    updatedAt: 2024-02-29T09:28:39.000Z
  },
  SubDepartment: {
    SubDepartmentID: 7,
    SubDepartmentName: 'counselor',
    createdAt: 2024-02-29T09:28:41.000Z,
    updatedAt: 2024-02-29T09:28:41.000Z,
    DepartmentId: 4
  },
  AssignedDepartment: {
    DepartmentID: 1,
    DepartmentName: 'IT',
    createdAt: 2024-02-29T09:28:39.000Z,
    updatedAt: 2024-02-29T09:28:39.000Z,
    SubDepartments: [ [SubDepartment] ]
  }
} 90




{
  TicketID: 88,
  TicketType: 'OverNight',
  Status: 'Pending',
  Description: 'my Team',
  LeadId: '',
  TicketResTimeInMinutes: 15,
  AssignedToDepartmentID: 1,
  AssignedToSubDepartmentID: 4,
  EmployeeID: 6,
  Querycategory: 'Extraa Edge',
  QuerySubcategory: 'Leads Shuffle',
  AttachmentUrl: null,
  updatedAt: 2024-03-09T19:53:03.612Z,
  createdAt: 2024-03-09T19:53:03.612Z
} 112