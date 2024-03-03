import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import Signup from "./Signup";
import PrivateRoute from "./PrivateRoute";
import DashBord from "./comp/DashBord";
import Home from "./comp/Home";
import Ticket from "./comp/Ticket";
import Reply from "./comp/Reply";
import Org from "./comp/Org";
import Team from "./comp/Team";
import DepartmentTickets from "./comp/DepartmentTickets";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user" element={<PrivateRoute />}>
          <Route path="dashboard" element={<DashBord />}>
            <Route path="Home" element={<Home />}>
              <Route path="Tickets" element={<DepartmentTickets />}></Route>
            </Route>
            <Route path="Ticket" element={<Ticket />}></Route>
            <Route path="Reply" element={<Reply />}></Route>
            <Route path="Org" element={<Org />}></Route>
            <Route path="Team" element={<Team />}></Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
