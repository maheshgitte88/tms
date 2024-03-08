import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import axios from "axios";
// import socket from "../socket";

import io from "socket.io-client";

import Reply from "./Reply";
import { useDispatch, useSelector } from "react-redux";
// import { updateDeptTicket } from path_to_DepTickets_reducer;

import {
  getDepTicket,
  updateDeptTicket,
  updateTicket,
} from "../app/features/DepTicketsSlices";
function Home() {
  // const socket = io.connect("http://localhost:2000");
  const user = JSON.parse(localStorage.getItem("user"));

  const socket = useMemo(() => io("http://localhost:2000"), []);

  const { DTickets, loading } = useSelector((state) => state.app);
  console.log(DTickets, 23);

  const [closedCount, setClosedCount] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const [isModalOpen, setModalOpen] = useState(false);

  const [selectedImageUrl, setSelectedImageUrl] = useState(null); // State to store selected image URL

  const ticketUpdatesContainerRef = useRef(null);

  const [ticketupdateData, setTicketUpdateData] = useState([]);
  const [chat, setChat] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("updatedTicketChat", (data) => {
      const datares = data.TicketUpdates;
      console.log(datares, 23);
      setChat((prevChat) => [...prevChat, datares]);
    });

    // Assuming you have the ticketId available
    if (selectedTicket) {
      socket.emit("joinTicketRoom", selectedTicket.TicketID);
      console.log(selectedTicket.TicketID, 38);
    }

    return () => {
      socket.off("updatedTicketChat");
    };
  }, [socket, selectedTicket]);

  const AssignedToSubDepartmentID = user.SubDepartmentID;
  console.log(AssignedToSubDepartmentID, 444444);
  useEffect(() => {
    socket.on("updatedDeptTicketChat", (data) => {
      console.log(data, 616263);
      // const DTickets = DTickets.push(data.createTicket);
      dispatch(updateDeptTicket(data));
      // console.log(datares, 23);
      // setChat((prevChat) => [...DTickets, datares]);
    });

    // Assuming you have the ticketId available
    if (AssignedToSubDepartmentID) {
      socket.emit("joinDepaTicketRoom", AssignedToSubDepartmentID);
      console.log(AssignedToSubDepartmentID, 38);
    }

    // return () => {
    //   socket.off("updatedDeptTicketChat");
    // };
  }, [socket]);

  console.log("chat ts", chat, 26);

  useEffect(() => {
    if (ticketUpdatesContainerRef.current) {
      ticketUpdatesContainerRef.current.scrollTop =
        ticketUpdatesContainerRef.current.scrollHeight;
    }
  }, [selectedTicket, chat]);
  const handleImageClick = (url) => {
    setSelectedImageUrl(url);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  // const user = JSON.parse(localStorage.getItem("user"));

  // function fetchTicketData() {
  //   if (user) {
  //     const dpId = user.DepartmentID;
  //     const SubDapId = user.SubDepartmentID;
  //     axios
  //       .get(`http://localhost:2000/department/${dpId}/${SubDapId}`)
  //       .then((response) => {
  //         setData(response.data.tickets);
  //         console.log(response.data, 16);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching data:", error);
  //       });
  //   }
  // }
  useEffect(() => {
    const counts = DTickets.reduce(
      (acc, ticket) => {
        if (ticket.Status === "Closed") {
          acc.closedCount++;
        } else if (ticket.Status === "Open") {
          acc.openCount++;
        } else if (ticket.Status === "Resolve") {
          acc.resolvedCount++;
        }
        return acc;
      },
      { closedCount: 0, openCount: 0, resolvedCount: 0 }
    );
    setClosedCount(counts.closedCount);
    setOpenCount(counts.openCount);
    setResolvedCount(counts.resolvedCount);
  }, [DTickets]);

  useEffect(() => {
    // fetchTicketData();
    const dpId = user.DepartmentID;
    const SubDapId = user.SubDepartmentID;
    dispatch(getDepTicket({ dpId, SubDapId }));
  }, []);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setTicketUpdateData(ticket.TicketUpdates);
  };

  useEffect(() => {
    setChat(ticketupdateData);
  }, [selectedTicket]);

  // Function to calculate the remaining time and extra time
  function calculateTime(createdAt, ticketResTimeInMinutes) {
    const startTime = new Date(createdAt);
    const endTime = new Date(
      startTime.getTime() + ticketResTimeInMinutes * 60000
    ); // Convert minutes to milliseconds
    const currentTime = new Date();
    const remainingTime = Math.max(0, endTime - currentTime); // Remaining time in milliseconds
    const extraTime = Math.max(0, currentTime - endTime); // Extra time in milliseconds
    return {
      remaining: remainingTime,
      extra: extraTime,
    };
  }

   function calculateRemainingTime(createdAt, ticketResTimeInMinutes) {
    const startTime = new Date(createdAt);
    const endTime = new Date(startTime.getTime() + ticketResTimeInMinutes * 60000); // Convert minutes to milliseconds
    const currentTime = new Date();
    const remainingTime = Math.max(0, endTime - currentTime); // Remaining time in milliseconds
    return Math.ceil(remainingTime / 60000); // Convert remaining time to minutes and round up
  }
 

  // Function to calculate the remaining time and extra time
  function calculateTime(createdAt, ticketResTimeInMinutes) {
    const startTime = new Date(createdAt);
    const endTime = new Date(startTime.getTime() + ticketResTimeInMinutes * 60000); // Convert minutes to milliseconds
    const currentTime = new Date();
    const remainingTime = Math.max(0, endTime - currentTime); // Remaining time in milliseconds
    const extraTime = Math.max(0, currentTime - endTime); // Extra time in milliseconds
    return {
      remaining: remainingTime,
      extra: extraTime
    };
  }

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Function to calculate the remaining time in minutes
    const calculateRemainingTime = (createdAt, ticketResTimeInMinutes) => {
      const startTime = new Date(createdAt);
      const endTime = new Date(startTime.getTime() + ticketResTimeInMinutes * 60000); // Convert minutes to milliseconds
      const currentTime = new Date();
      const remainingTime = Math.max(0, endTime - currentTime); // Remaining time in milliseconds
      return Math.ceil(remainingTime / 60000); // Convert remaining time to minutes and round up
    };

    // Update the remaining time for each ticket in real-time
    const timer = setInterval(() => {
      const updatedTickets = DTickets.map(ticket => ({
        ...ticket,
        remainingTime: calculateRemainingTime(ticket.createdAt, ticket.TicketResTimeInMinutes)
      }));
      dispatch(updateTicket(updatedTickets)); // Dispatch action to update ticket data
    }, 1000); // Update every second

    return () => clearInterval(timer); // Clean up timer when component unmounts
  }, [DTickets, dispatch]);


  return (
    <div className="container mx-auto p-1 flex flex-col sm:flex-row text-sm">
      <div className="sm:w-3/4">
        <div className="mb-4">
          <h6 className="font-semibold mb-2">Comman Bucket</h6>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <Link to={"Tickets"}>
              <div className="bg-red-200 p-4 rounded shadow flex justify-around hover:bg-blue-400">
                <div>
                  <strong>Ticket</strong>
                  <h5 className="font-semibold">{openCount}</h5>
                </div>
                <i className="bi bi-postcard text-4xl"></i>
              </div>
            </Link>
            <div className="bg-green-200 p-4 rounded shadow flex justify-around hover:bg-green-400">
              <div>
                <strong>My Feedback</strong>
                <h5 className="font-semibold">{closedCount}</h5>
              </div>
            </div>
          </div>
        </div>
        <Outlet></Outlet>

        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content">
              <img
                src={selectedImageUrl}
                alt="Selected Attachment"
                className="modal-image"
              />
            </div>
          </div>
        )}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>T-Type</th>
                <th>Lead-Id</th>
                <th>Status</th>
                <th>Description</th>
                <th>Querycategory</th>
                <th>QuerySubcategory</th>
                <th>RStatus</th>
                <th>RTimestamp</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {DTickets.map((ticket, index) => {
                const { remaining, extra } = calculateTime(
                  ticket.createdAt,
                  ticket.TicketResTimeInMinutes
                );
                return (
                  <tr key={index} className="cursor-pointer">
                    <td>{ticket.TicketID}</td>
                    <td>{ticket.TicketType}</td>
                    <td>{ticket.LeadId ? ticket.LeadId : "NA"}</td>
                    <td className="text-red-600">{ticket.Status}</td>
                    <td>{ticket.Description}</td>
                    <td>{ticket.Querycategory}</td>
                    <td>{ticket.QuerySubcategory}</td>
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
                    <td style={{ color: remaining > 0 ? 'green' : 'red' }}>
                  {formatTime(remaining)}
                </td>
                <td style={{ color: extra === "00:00:00" && remaining > 0 ? 'green' : (extra === "00:00:00" && remaining === 0) ? 'red' : extra > 0 ? 'red' : 'green' }}>
                  {extra === "00:00:00" ? formatTime(remaining) : formatTime(extra)}
                  
                </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* <DepartmentTickets data={data} Tstatus={'Open'} /> */}
        <div className="mb-4">
          <h6 className="font-semibold mb-2">Tickets For Me</h6>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-200 p-4 rounded shadow flex justify-around hover:bg-green-400">
              <div>
                <strong>Resolve</strong>
                <h5 className="font-semibold">{resolvedCount}</h5>
              </div>
              <i className="bi bi-journal-check text-4xl"></i>
            </div>

            <div className="bg-pink-200 p-4 rounded shadow flex justify-around hover:bg-pink-400">
              <div>
                <strong>Closed</strong>
                <h5 className="font-semibold">{closedCount}</h5>
              </div>
              <i className="bi bi-journal-check text-4xl"></i>
            </div>
            <div className="bg-purple-200 p-4 rounded shadow">Card 3</div>
            <div className="bg-orange-200 p-4 rounded shadow">Card 4</div>
            <div className="bg-red-200 p-4 rounded shadow">Card 5</div>
            <div className="bg-indigo-200 p-4 rounded shadow">Card 6</div>
          </div>
        </div>

        <div>
          <h6 className="font-semibold mb-2">Tickets raised by me</h6>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-teal-200 p-4 rounded shadow">Card 1</div>
            <div className="bg-gray-200 p-4 rounded shadow">Card 2</div>
            <div className="bg-cyan-200 p-4 rounded shadow">Card 3</div>
            <div className="bg-lime-200 p-4 rounded shadow">Card 4</div>
          </div>
        </div>
      </div>
      {/* Right Column */}
      <div className="sm:w-1/4">
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
                      update.EmployeeID ? "receiver" : "sender"
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
      ;
    </div>
  );
}

export default Home;
