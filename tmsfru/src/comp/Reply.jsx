import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
// import socket from "../socket";

import io from 'socket.io-client'

// const socket = io.connect("http://localhost:2000");

const Reply = ({ ticketData }) => {
  if (!ticketData) {
    return <div>Loading...</div>; // or any other loading indicator
  }
  const socket = useMemo(() =>io("http://localhost:2000"),[]);

  
  const [formData, setFormData] = useState({
    TicketID: "",
    UpdateDescription: "",
    DepartmentID: JSON.parse(localStorage.getItem("user")).DepartmentID,
    EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID,
    SubDepartmentID: JSON.parse(localStorage.getItem("user")).SubDepartmentID,
    Feedback: "",
    UpdateStatus: "Resolve",
    files: null,
  });

  useEffect(() => {
    if (ticketData) {
      setFormData({
        TicketID: ticketData?.TicketID || "",
        UpdateDescription: "",
        DepartmentID: JSON.parse(localStorage.getItem("user")).DepartmentID,
        EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID,
        SubDepartmentID: JSON.parse(localStorage.getItem("user"))
          .SubDepartmentID,
        Feedback: "",
        UpdateStatus: "Resolve",
        files: null,
      });
    }
  }, [ticketData]);

  console.log("ticketData", ticketData);
  console.log("formData", formData);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      files: e.target.files,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.files || formData.UpdateDescription.length > 0) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("TicketID", formData.TicketID);
        formDataToSend.append("UpdateDescription", formData.UpdateDescription);
        formDataToSend.append("DepartmentID", formData.DepartmentID);
        formDataToSend.append("EmployeeID", formData.EmployeeID);
        formDataToSend.append("SubDepartmentID", formData.SubDepartmentID);
        formDataToSend.append("Feedback", formData.Feedback);
        formDataToSend.append("UpdateStatus", formData.UpdateStatus);
        // Append each file to formDataToSend
        if (formData.files) {
          for (const file of formData.files) {
            formDataToSend.append("files", file);
          }
        }
        const response = await axios.post(
          "http://localhost:2000/api/ticket-updates",
          formDataToSend
        );
        socket.emit('ticketUpdate', { TicketUpdates: formData, TicketIDasRoomId: ticketData.TicketID })
        // socket.emit('ticketUpdate', {TicketUpdates: formData, TicketIDasRoomId:ticketData.TicketID })
        setFormData({
          TicketID: ticketData?.TicketID || "",
          UpdateDescription: "",
          DepartmentID: JSON.parse(localStorage.getItem("user")).DepartmentID,
          EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID,
          SubDepartmentID: JSON.parse(localStorage.getItem("user"))
            .SubDepartmentID,
          Feedback: "",
          UpdateStatus: "",
          files: null,
        });
        console.log("Response:", response.data);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      console.log("key pressed");
      event.preventDefault();
      event.target.form.dispatchEvent(
        new Event("submit", { cancelable: true })
      );
    }
  };
  const handleStatusUpdate = (status) => {
    setFormData({
      ...formData,
      UpdateStatus: status,
    });
    
  };



  return (
    <div className="max-w-md mx-auto mt-1 m-2 p-2 relative">
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="mb-1">
          <div className="absolute left-0 top-0 flex items-center">
            <label
              htmlFor="files"
              className="m-4 py-4 cursor-pointer border rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500 hover:text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <input
                type="file"
                id="files"
                name="files"
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg, .jpeg, .png, .gif, .pdf"
                multiple
              />
            </label>
          </div>
          <textarea
            id="UpdateDescription"
            name="UpdateDescription"
            value={formData.UpdateDescription}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 py-4 w-full border rounded-md"
          />
        </div>

        <div className="flex justify-between">
          <div>
            <button
              onClick={() => handleStatusUpdate("Resolved")}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Resolve
            </button>
            <button
              onClick={() => handleStatusUpdate("Closed")}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
            >
              Close
            </button>
          </div>

          <div>
            {formData.UpdateDescription || formData.files ? (
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2  rounded hover:bg-blue-600 mr-2"
              >
                Send
              </button>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Reply;
