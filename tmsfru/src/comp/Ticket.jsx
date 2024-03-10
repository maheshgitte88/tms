import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reply from "./Reply";
import io from "socket.io-client";
import TicketForm from "./TicketForm";
import { useDispatch, useSelector } from "react-redux";
import { getEmployeeTicket } from "../app/features/EmpTicketsSlices";
function Ticket() {
  const socket = useMemo(() => io("http://localhost:2000"), []);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const ticketUpdatesContainerRef = useRef(null);
  const [ticketupdateData, setTicketUpdateData] = useState([]);
  const [chat, setChat] = useState([]);
  const dispatch = useDispatch();
  const { ETickets, loading } = useSelector((state) => state.empTickets);

  const user = JSON.parse(localStorage.getItem("user"));

  console.log(ETickets, 2020);
  const [formData, setFormData] = useState({
    TicketType: "Normal Ticket", // Default value from local storage
    Status: "Open", // Initial status
    Description: "",
    LeadId: "",
    AssignedToDepartmentID: 1, // Assigned department from local storage
    AssignedToSubDepartmentID: 1, // Assigned sub department from local storage
    // AssignedToDepartmentID:JSON.parse(localStorage.getItem("user")).DepartmentID, // Assigned department from local storage
    // AssignedToSubDepartmentID:JSON.parse(localStorage.getItem("user")).SubDepartmentID,// Assigned sub department from local storage
    files: null, // Change to null for initial state
    EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID, // EmployeeID from user object in local storage
  });

  useEffect(() => {
    socket.on("updatedTicketChat", (data) => {
      const datares = data.TicketUpdates;
      setChat((prevChat) => [...prevChat, datares]);
    });
    if (selectedTicket) {
      socket.emit("joinTicketRoom", selectedTicket.TicketID);
    }

    return () => {
      socket.off("updatedTicketChat");
    };
  }, [socket, selectedTicket]);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setTicketUpdateData(ticket.TicketUpdates);
  };

  useEffect(() => {
    if (ticketUpdatesContainerRef.current) {
      ticketUpdatesContainerRef.current.scrollTop =
        ticketUpdatesContainerRef.current.scrollHeight;
    }
  }, [selectedTicket, chat]);

  // useEffect(() => {
  //   // Count tickets based on their status
  //   const counts = data.reduce(
  //     (acc, ticket) => {
  //       if (ticket.Status === "Closed") {
  //         acc.closedCount++;
  //       } else if (ticket.Status === "Open") {
  //         acc.openCount++;
  //       } else if (ticket.Status === "Resolve") {
  //         acc.resolvedCount++;
  //       }
  //       return acc;
  //     },
  //     { closedCount: 0, openCount: 0, resolvedCount: 0 }
  //   );
  //   setClosedCount(counts.closedCount);
  //   setOpenCount(counts.openCount);
  //   setResolvedCount(counts.resolvedCount);
  // }, [data]);

  useEffect(() => {
    if (user) {
      const EmpId = user.EmployeeID;
      dispatch(getEmployeeTicket(EmpId));
    }
  }, []);

  // const handleTicketClick = (ticket) => {
  //   setSelectedTicket(ticket);
  // };

  useEffect(() => {
    setChat(ticketupdateData);
  }, [selectedTicket]);

  return (
    <>
      <div className="container mx-auto p-1 flex flex-col sm:flex-row text-sm">
        {/* Left Column */}
        <div className="sm:w-4/3">
          {/* <div className="p-1 bg-red-400 font-bold text-center">
          <Link to={"Tickets"}>Me ||</Link> <Link to={"Tickets"}> Tickets</Link>
        </div> */}
          {/* Container 1 with 2 cards */}
          <div className="mb-4">
            <h6 className="font-semibold mb-2">Comman Bucket</h6>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <Link to={"Tickets"}>
                <div className="bg-red-200 p-4 rounded shadow flex justify-around hover:bg-blue-400">
                  <div>
                    <strong>Ticket</strong>
                    {/* <h5 className="font-semibold">{openCount}</h5> */}
                  </div>
                  <i className="bi bi-postcard text-4xl"></i>
                </div>
              </Link>

              <div className="bg-green-200 p-4 rounded shadow flex justify-around hover:bg-green-400">
                <div>
                  <strong>My Feedback</strong>
                  {/* <h5 className="font-semibold">{closedCount}</h5> */}
                </div>
                {/* <i className="bi bi-journal-check text-4xl"></i> */}
              </div>
            </div>
          </div>
          <TicketForm />

          <div className="table-container">
            <table
              className={`custom-table ${
                selectedTicket ? "selected-table" : ""
              }`}
            >
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Status</th>
                  <th>Lead-Id</th>
                  <th>Description</th>
                  <th>Querycategory</th>
                  <th>QuerySubcategory</th>
                  <th>To-Det</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {ETickets.map((ticket) => (
                  <tr
                    key={ticket.TicketID}
                    onClick={() => handleTicketClick(ticket)}
                    className={`cursor-pointer ${
                      selectedTicket === ticket ? "selected-row" : ""
                    }`}
                  >
                    <td>{ticket.TicketID}</td>
                    <td className="text-red-600">{ticket.Status}</td>
                    <td>{ticket.LeadId ? <>{ticket.LeadId}</> : <>NA</>}</td>
                    <td>{ticket.Description}</td>
                    <td>{ticket.Querycategory}</td>
                    <td>{ticket.QuerySubcategory}</td>
                    <td>{ticket.Department.DepartmentName}</td>
                    {/* <td>{ticket.Department.SubDepartments.SubDepartmentName}</td> */}
                    {/* <td>{ticket.Employee.Department.DepartmentName}</td> */}
                    <td>{ticket.TicketResTimeInMinutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="sm:w-1/3">
          {selectedTicket && (
            <div
              ref={ticketUpdatesContainerRef}
              className="m-2 p-2 bg-orange-400 border border-gray-300 overflow-y-auto max-h-96"
            >
              <div className="mt-4">
                <div className="ticket-updates-container">
                  {chat.map((update, index) => (
                    <div
                      key={index}
                      className={`ticket-update ${
                        update.EmployeeID === 1 ? "sender" : "receiver"
                      }`}
                    >
                      <div className="update-info">
                        <p>{update.UpdateStatus}</p>
                        <p>{update.UpdateDescription}</p>
                        {/* <small style={{ fontSize: "8px", color: "blue" }}>
                        {update.updatedAt ? formatDate(update.updatedAt) : ""}
                      </small> */}
                      </div>

                      <div className="update-attachments">
                        {update.UpdatedAttachmentUrls ? (
                          <>
                            {" "}
                            {update.UpdatedAttachmentUrls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                onClick={() => handleImageClick(url)} // Pass URL to handleImageClick
                                alt={`Attachment ${index + 1}`}
                              />
                            ))}
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <Reply ticketData={selectedTicket} />
        </div>
      </div>
    </>
  );
}
export default Ticket;
