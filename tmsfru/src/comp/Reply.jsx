import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
// import socket from "../socket";

import io from "socket.io-client";
import StarRating from "./StarRating";

// const socket = io.connect("http://localhost:2000");

const Reply = ({ ticketData }) => {
  if (!ticketData) {
    return <div>Loading...</div>; // or any other loading indicator
  }
  const socket = useMemo(() => io("http://localhost:2000"), []);

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    TicketId: "",
    UpdateDescription: "",
    DepartmentID: JSON.parse(localStorage.getItem("user")).DepartmentID,
    EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID,
    SubDepartmentID: JSON.parse(localStorage.getItem("user")).SubDepartmentID,
    Feedback: 0,
    UpdateStatus: "",
    files: null,
  });

  console.log(ticketData, 27);

  useEffect(() => {
    if (ticketData) {
      setFormData({
        TicketId: ticketData?.TicketID || "",
        UpdateDescription: "",
        DepartmentID: JSON.parse(localStorage.getItem("user")).DepartmentID,
        EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID,
        SubDepartmentID: JSON.parse(localStorage.getItem("user"))
          .SubDepartmentID,
        Feedback: 0,
        UpdateStatus: "",
        files: null,
      });
    }
  }, [ticketData]);

  // console.log("ticketData", ticketData);
  // console.log("formData", formData);

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
        formDataToSend.append("TicketId", formData.TicketId);
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
        socket.emit("ticketUpdate", {
          TicketUpdates: formData,
          TicketIDasRoomId: ticketData.TicketID,
        });
        // socket.emit('ticketUpdate', {TicketUpdates: formData, TicketIDasRoomId:ticketData.TicketID })
        setFormData({
          TicketId: ticketData?.TicketID || "",
          UpdateDescription: "",
          DepartmentID: JSON.parse(localStorage.getItem("user")).DepartmentID,
          EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID,
          SubDepartmentID: JSON.parse(localStorage.getItem("user"))
            .SubDepartmentID,
          Feedback: 0,
          UpdateStatus: ticketData?.Status,
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

  const handleStatusUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:2000/Ticket/resolution/${ticketData?.TicketID}?resolved=Resolved`,
        formData
      );
      console.log(response.data, 123);
    } catch (error) {
      console.log(error, 125);
    }
  };

  const handleStatusUpdateClosed = async () => {
    try {
      const response = await axios.put(
        `http://localhost:2000/Ticket/Closed/${ticketData?.TicketID}?Closed=Closed`,
        formData
      );
      console.log(response.data, 123);
      if (response) {
      }
    } catch (error) {
      console.log(error, 125);
    }
  };

  const handleFeedbackChange = (newRating) => {
    setFormData((prevState) => ({
      ...prevState,
      Feedback: newRating,
    }));
  };

  const createdAt = new Date(ticketData.createdAt);
  const resolutionCreatedAt = ticketData.TicketResolution?.createdAt
  ? new Date(ticketData.TicketResolution.createdAt)
  : null;  
  const timeToSolvedTicketInMinutes = Math.floor((resolutionCreatedAt - createdAt) / (1000 * 60));

  // Calculate ExtraTimeTaken
  const extraTimeTaken = timeToSolvedTicketInMinutes - ticketData.TicketResTimeInMinutes;

  // Get status color based on ticket status
  const getStatusColor = () => {
    switch (ticketData.Status) {
      case 'Pending':
        return 'text-red-600';
      case 'Resolved':
        return 'text-blue-600';
      case 'Closed':
        return 'text-green-600';
      default:
        return 'text-black';
    }
  };

  return (
    <div className="max-w-md mx-auto mt-1 m-2 p-2 relative">
      {ticketData.Status === "Pending" ||
      (ticketData.Status === "Resolved" &&
        ticketData.Employee.EmployeeID === user.EmployeeID) ? (
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
              {(formData.UpdateDescription || formData.files) && (
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2  rounded hover:bg-blue-600 mr-2"
                >
                  Send
                </button>
              )}
            </div>
          </div>
        </form>
      ) : null}

      <div className="flex justify-between">
        <div>
          {ticketData.Status === "Pending" &&
          ticketData.Employee.EmployeeID !== user.EmployeeID ? (
            <>
              <button
                onClick={handleStatusUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Resolve
              </button>{" "}
            </>
          ) : ticketData.Status === "Resolved" &&
            ticketData.Employee.EmployeeID === user.EmployeeID ? (
            <>
              <StarRating
                value={formData.Feedback}
                onChange={handleFeedbackChange}
              />
              <button
                onClick={handleStatusUpdateClosed}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
              >
                Close
              </button>{" "}
            </>
          ) : null}
        </div>
      </div>







      <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Ticket Details</h2>
      <div className="mb-4">
        <p className="text-gray-600 mb-2"><b>Status:</b> <span className={getStatusColor()}>{ticketData.Status}</span></p>
        <p className="text-gray-600 mb-2"><b>Description:</b> {ticketData.Description}</p>
        <p className="text-gray-600 mb-2"><b>Category:</b> {ticketData.Querycategory}</p>
        <p className="text-gray-600 mb-2"><b>Subcategory:</b> {ticketData.QuerySubcategory}</p>
        <p className="text-gray-600 mb-2"><b>Resolved Time:</b> {ticketData.TicketResTimeInMinutes} minutes</p>
        {ticketData.TicketResolution ? 
        <>
        <p className="text-gray-600 mb-2"><b>Solved Time (Minutes):</b> {timeToSolvedTicketInMinutes}</p>
        <p className="text-gray-600 mb-2"><b>Extra Time Taken (Minutes):</b> {extraTimeTaken}</p>
        <p className="text-gray-600 mb-2"><b>Resolution Description:</b> {ticketData.ResolutionDescription}</p>

        {ticketData.CloseDescription || ticketData.CloseDescription ? <>
        <p className="text-gray-600 mb-2"><b>Resolution Feedback:</b> {ticketData.ResolutionFeedback}</p>
        <p className="text-gray-600 mb-2"><b>Closed Description:</b> {ticketData.CloseDescription}</p>
        </> :<></> }
      
        </>
         :<></>}
       
      </div>

      <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Ticket Updates</h2>
      <div className="mb-4">
        {ticketData.TicketUpdates.map((update, index) => (
          <div key={index} className="border-b border-gray-300 mb-4 pb-4">
            <p className="text-gray-600 mb-2"><b>Update {index + 1}</b></p>
            <p className="text-gray-600 mb-2"><b>Description:</b> {update.UpdateDescription}</p>
            <p className="text-gray-600 mb-2"><b>Employee:</b> {update.Employee.EmployeeName}</p>
            <p className="text-gray-600 mb-2"><b>Timestamp:</b> {update.UpdateTimestamp}</p>
          </div>
        ))}
      </div>

      {ticketData.Status === "Closed" && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Ticket Resolution</h2>
          <div className="mb-4">
            <p className="text-gray-600 mb-2"><b>Resolution Description:</b> {ticketData.TicketResolution.ResolutionDescription}</p>
            <p className="text-gray-600 mb-2"><b>Resolved By:</b> {ticketData.TicketResolution.ResEmployeeID}</p>
            <p className="text-gray-600 mb-2"><b>Resolved Time:</b> {ticketData.TicketResolution.updatedAt}</p>
          </div>
        </div>
      )}
    </div>



      {/* <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Ticket Details</h2>
      <div className="mb-4">
        <p className="text-gray-600 mb-2">Ticket Type: {ticketData.TicketType}</p>
        <p className="text-gray-600 mb-2">Status: {ticketData.Status}</p>
        <p className="text-gray-600 mb-2">Description: {ticketData.Description}</p>
        <p className="text-gray-600 mb-2">Category: {ticketData.Querycategory}</p>
        <p className="text-gray-600 mb-2">Subcategory: {ticketData.QuerySubcategory}</p>
        <p className="text-gray-600 mb-2">Resolved Time: {ticketData.TicketResTimeInMinutes} minutes</p>
        <p className="text-gray-600 mb-2">Resolution Description: {ticketData.ResolutionDescription}</p>
        <p className="text-gray-600 mb-2">Resolution Feedback: {ticketData.ResolutionFeedback}</p>
        <p className="text-gray-600 mb-2">Closed Description: {ticketData.CloseDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Ticket Updates</h2>
      <div className="mb-4">
        {ticketData.TicketUpdates.map((update, index) => (
          <div key={index} className="border-b border-gray-300 mb-4 pb-4">
            <p className="text-gray-600 mb-2">Update {index + 1}</p>
            <p className="text-gray-600 mb-2">Description: {update.UpdateDescription}</p>
            <p className="text-gray-600 mb-2">Employee: {update.Employee.EmployeeName}</p>
            <p className="text-gray-600 mb-2">Timestamp: {update.UpdateTimestamp}</p>
          </div>
        ))}
      </div>

      {ticketData.Status === "Closed" && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">Ticket Resolution</h2>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Resolution Description: {ticketData.TicketResolution.ResolutionDescription}</p>
            <p className="text-gray-600 mb-2">Resolved By: {ticketData.TicketResolution.ResEmployeeID}</p>
            <p className="text-gray-600 mb-2">Resolved Time: {ticketData.TicketResolution.updatedAt}</p>
          </div>
        </div>
      )}
    </div> */}

      {/* <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Ticket Details</h2>
      <div className="mb-4">
        <p className="text-gray-600 mb-2">Ticket Type: {ticketData.TicketType}</p>
        <p className="text-gray-600 mb-2">Status: {ticketData.Status}</p>
        <p className="text-gray-600 mb-2">Description: {ticketData.Description}</p>
        <p className="text-gray-600 mb-2">Category: {ticketData.Querycategory}</p>
        <p className="text-gray-600 mb-2">Subcategory: {ticketData.QuerySubcategory}</p>
        <p className="text-gray-600 mb-2">Resolved Time: {ticketData.TicketResTimeInMinutes} minutes</p>
        <p className="text-gray-600 mb-2">Resolution Description: {ticketData.ResolutionDescription}</p>
        <p className="text-gray-600 mb-2">Resolution Feedback: {ticketData.ResolutionFeedback}</p>
        <p className="text-gray-600 mb-2">Closed Description: {ticketData.CloseDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mb-4">Ticket Updates</h2>
      <div className="mb-4">
        {ticketData.TicketUpdates.map((update, index) => (
          <div key={index} className="border-b border-gray-300 mb-4 pb-4">
            <p className="text-gray-600 mb-2">Update {index + 1}</p>
            <p className="text-gray-600 mb-2">Description: {update.UpdateDescription}</p>
            <p className="text-gray-600 mb-2">Employee: {update.Employee.EmployeeName}</p>
            <p className="text-gray-600 mb-2">Timestamp: {update.UpdateTimestamp}</p>
          </div>
        ))}
      </div>

      {ticketData.Status === "Closed" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Ticket Resolution</h2>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Resolution Description: {ticketData.TicketResolution.ResolutionDescription}</p>
            <p className="text-gray-600 mb-2">Resolved By: {ticketData.TicketResolution.ResEmployeeID}</p>
            <p className="text-gray-600 mb-2">Resolved Time: {ticketData.TicketResolution.updatedAt}</p>
          </div>
        </div>
      )}
    </div> */}




    </div>
  );
};

export default Reply;
