import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reply from "./Reply";
import io from "socket.io-client";
import TicketForm from "./TicketForm";
function Ticket() {

  const socket = useMemo(() =>io("http://localhost:2000"),[]);

  const [ownTicketData, setOwnTicketData] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const ticketUpdatesContainerRef = useRef(null);
  const [ticketupdateData, setTicketUpdateData] = useState([]);
  const [chat, setChat] = useState([]);

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
      console.log(datares, 23);
      setChat((prevChat) => [...prevChat, datares]);
    });
    // Assuming you have the ticketId available
    if(selectedTicket){
      socket.emit("joinTicketRoom", selectedTicket.TicketID);
      console.log(selectedTicket.TicketID, 38)
    }

    return () => {
      socket.off("updatedTicketChat");
  };
  }, [socket, selectedTicket]);

  const user = JSON.parse(localStorage.getItem("user"));

  function fetchOwnTicketData() {
    if (user) {
      const dpId = user.DepartmentID;
      const SubDapId = user.SubDepartmentID;
      const EmpId = user.EmployeeID;
      console.log(dpId, SubDapId, EmpId, 25);
      axios
        .get(`http://localhost:2000/Tickets/${EmpId}`)
        .then((response) => {
          setOwnTicketData(response.data.tickets);
          console.log(response.data, 30);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }

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
    fetchOwnTicketData();
    // FetchQueryData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      files: e.target.files,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    for (const key in formData) {
      formDataObj.append(key, formData[key]);
    }
    for (const file of formData.files) {
      formDataObj.append("files", file);
    }
    try {
      const response = await axios.post(
        "http://localhost:2000/Ticket/Create",
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure correct content type for file uploads
          },
        }
      );
      console.log(response.data); // Handle success response
    } catch (error) {
      console.error(error); // Handle error response
    }
  };

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
        <div className="sm:w-2/3">
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

          <form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto p-1 bg-white rounded-lg shadow-md"
          >
            <div className="mb-4">
              <textarea
                id="description"
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                rows={3}
                className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter a brief description"
                required
              />
            </div>

            <div className="mb-4">
              <input
                id="leadId"
                name="LeadId"
                value={formData.LeadId}
                onChange={handleChange}
                type="text"
                className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter Lead ID"
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="file"
                id="files"
                name="files"
                onChange={handleFileChange}
                className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                accept=".jpg, .jpeg, .png, .gif, .pdf"
                multiple
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted file types: .jpg, .jpeg, .png, .gif, .pdf
              </p>
            </div>

            {/* Add more input fields for other ticket data */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Submit
            </button>
          </form>

          <div className="table-container">
            <table
              className={`custom-table ${
                selectedTicket ? "selected-table" : ""
              }`}
            >
              <thead>
                <tr>
                  <th>Id</th>
                  <th>T-Type</th>
                  <th>Lead-Id</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>From</th>
                  <th>Depat</th>
                  <th>RStatus</th>
                  <th> RTimestamp</th>
                </tr>
              </thead>
              <tbody>
                {ownTicketData.map((ticket) => (
                  <tr
                    key={ticket.TicketID}
                    onClick={() => handleTicketClick(ticket)}
                    className={`cursor-pointer ${
                      selectedTicket === ticket ? "selected-row" : ""
                    }`}
                  >
                    <td>{ticket.TicketID}</td>
                    <td>{ticket.TicketType}</td>
                    <td>{ticket.LeadId ? <>{ticket.LeadId}</> : <>NA</>}</td>
                    <td className="text-red-600">{ticket.Status}</td>
                    <td>{ticket.Description}</td>
                    <td>{ticket.Employee.Location}</td>
                    <td>{ticket.Employee.EmployeeName}</td>
                    <td>{ticket.Employee.Department.DepartmentName}</td>
                    <td>
                      {ticket.TicketResolution
                        ? ticket.TicketResolution.ResolutionStatus
                        : "-"}
                    </td>
                    <td>
                      {ticket.TicketResolution
                        ? ticket.TicketResolution.ResolutionTimestamp
                        : "-"}
                    </td>
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
