import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import io from "socket.io-client";
import Reply from "./Reply";
import { useDispatch, useSelector } from "react-redux";
import logo from "../Context/logo.png";
// import addNotification from 'react-push-notification';

import {
  getDepTicket,
  updateDeptTicket,
  updateDtTicketUpdate,
  getDepClosedTicket,
  getDepResolvedTicket,
  updateTicket,
} from "../app/features/DepTicketsSlices";
import axios from "axios";

function Home() {
  // const socket = io.connect("http://localhost:2000");
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user, 20);
  const socket = useMemo(() => io("http://localhost:2000"), []);

  const { DTickets, DTClosedickets, DTResolvedickets, loading } = useSelector(
    (state) => state.app
  );
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const [closedCount, setClosedCount] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const [isModalOpen, setModalOpen] = useState(false);

  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const ticketUpdatesContainerRef = useRef(null);

  const [ticketupdateData, setTicketUpdateData] = useState([]);

  const dispatch = useDispatch();

  const AssignedToSubDepartmentID = user.SubDepartmentID;
  useEffect(() => {
    socket.on("updatedDeptTicketChat", (data) => {
      dispatch(updateDeptTicket(data));
    });

    if (AssignedToSubDepartmentID) {
      socket.emit("joinDepaTicketRoom", AssignedToSubDepartmentID);
    }
  }, [socket]);

  useEffect(() => {
    if (ticketUpdatesContainerRef.current) {
      ticketUpdatesContainerRef.current.scrollTop =
        ticketUpdatesContainerRef.current.scrollHeight;
    }
  }, [selectedTicket, ticketupdateData]);

  const handleImageClick = (url) => {
    setSelectedImageUrl(url);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const counts = DTickets.reduce(
      (acc, ticket) => {
        if (ticket.Status === "Closed") {
          acc.closedCount++;
        } else if (ticket.Status === "Pending") {
          acc.openCount++;
        } else if (ticket.Status === "Resolved") {
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
    const dpId = user.DepartmentID;
    const SubDapId = user.SubDepartmentID;
    dispatch(getDepTicket({ departmentId: dpId, SubDepartmentId: SubDapId }));
  }, [getDepClosedTicket,
    getDepResolvedTicket]);

  const GetClosedTickets = async () => {
    const dpId = user.DepartmentID;
    const SubDapId = user.SubDepartmentID;
    const EmployeeID = user.EmployeeID;
    dispatch(
      getDepClosedTicket({
        departmentId: dpId,
        SubDepartmentId: SubDapId,
        EmployeeID: EmployeeID,
      })
    );
  };
  const GetResolvedTickets = async () => {
    const dpId = user.DepartmentID;
    const SubDapId = user.SubDepartmentID;
    const EmployeeID = user.EmployeeID;
    dispatch(
      getDepResolvedTicket({
        departmentId: dpId,
        SubDepartmentId: SubDapId,
        EmployeeID: EmployeeID,
      })
    );
  };

  const handleTicketClick = async (ticket) => {
    setSelectedTicket(ticket);
  };

  const TicketUpdateData = async (selectedTicket) => {
    try {
      const TicketUpdates = await axios.get(
        `http://localhost:2000/Ticket-updates/${selectedTicket}`
      );
      if (TicketUpdates) {
        setTicketUpdateData(TicketUpdates.data);
      }
    } catch (error) {
      console.log("No Ticket Updates for this Ticket");
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      TicketUpdateData(selectedTicket.TicketID);
      socket.emit("joinTicketRoom", selectedTicket.TicketID);
    }
  }, [selectedTicket]);

  useEffect(() => {
    const socket = io("http://localhost:2000");

    DTickets.forEach((ticket) => {
      socket.emit("joinTicketRoom", ticket.TicketID);
    });
    // socket.emit("ticketUpdate", {TicketUpdates: formData, TicketIDasRoomId: ticketData.TicketID});
    // Listen for ticket updates
    socket.on("updatedTicketChat", (data) => {
      // Handle ticket update notification here
      dispatch(updateDtTicketUpdate(data.TicketUpdates));
      setTicketUpdateData((prevChat) => [...prevChat, data.TicketUpdates]);

      if (data.TicketUpdates.EmployeeID !== user.EmployeeID) {
        showNotification(data);
      }
    });

    // Check for notification permission only once on component mount
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [socket, selectedTicket, DTickets]);

  const showNotification = async (data) => {
    if ("Notification" in window) {
      await Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
      });
    }
    console.log(data, 828282);
    if (notificationPermission === "granted") {
      const { TicketUpdates, TicketIDasRoomId } = data;
      const notificationTitle = `Ticket Update`;
      console.log(
        `Ticket ${TicketIDasRoomId} has ${TicketUpdates.UpdateDescription} updates.`
      );
      const notificationBody = `Ticket ${TicketIDasRoomId} has ${TicketUpdates.UpdateDescription} updates From ${TicketUpdates.EmployeeID}.`;
      const notification = new Notification(notificationTitle, {
        body: notificationBody,
        icon: `${logo}`,
      });

      notification.onclick = () => {
        console.log("Notification clicked");
        const ticketDetailsURL = `http://localhost:5173/user/dashboard/Home`; // Assuming the URL path structure
        window.location.href = ticketDetailsURL;
      };
    }
  };

  return (
    <div className="container mx-auto p-1 flex flex-col sm:flex-row text-sm">
      <div className="sm:w-full">
        <div className="mb-4">
          {/* <h6 className="font-semibold mb-2">Comman Bucket</h6> */}
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

        {/* <Nitifications /> */}

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
          <table
            className={`custom-table ${selectedTicket ? "selected-table" : ""}`}
          >
            <thead>
              <tr>
                <th>Id</th>
                <th>T-Type</th>
                <th>Lead-Id</th>
                <th>Status</th>
                {/* <th>Description</th> */}
                <th>Query</th>
                <th>Sub-Query</th>
                <th>Location</th>
                <th>updates</th>
                <th>From</th>
                <th>Depat</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {DTickets.map((ticket) => (
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
                  {/* <td>{ticket.Description}</td> */}
                  <td>{ticket.Querycategory}</td>
                  <td>{ticket.QuerySubcategory}</td>
                  <td>{ticket.Employee.Location}</td>
                  <td>
                    <p className="bg-red-400 text-center rounded-full">
                      {ticket.TicketUpdates ? (
                        <>{ticket.TicketUpdates.length}</>
                      ) : (
                        <>0</>
                      )}
                    </p>
                  </td>
                  <td>{ticket.Employee.EmployeeName}</td>
                  <td>{ticket.Employee.Department.DepartmentName}</td>
                  <td>{ticket.TicketResTimeInMinutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* <DepartmentTickets data={data} Tstatus={'Open'} /> */}
        <div className="mb-4">
          <h6 className="font-semibold mb-2">Tickets For Me</h6>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              onClick={GetResolvedTickets}
              className="bg-green-200 p-4 rounded shadow flex justify-around hover:bg-green-400"
            >
              <div>
                <strong>Resolve</strong>
                <h5 className="font-semibold">{resolvedCount}</h5>
              </div>
              <i className="bi bi-journal-check text-4xl"></i>
            </div>

            <div
              onClick={GetClosedTickets}
              className="bg-pink-200 p-4 rounded shadow flex justify-around hover:bg-pink-400"
            >
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
          {DTClosedickets.length > 0 ? (
            <>
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
                      {/* <th>Description</th> */}
                      <th>Query</th>
                      <th>Sub-Query</th>
                      <th>Location</th>
                      <th>updates</th>
                      <th>From</th>
                      <th>Depat</th>
                      <th>Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {DTClosedickets.map((ticket) => (
                      <tr
                        key={ticket.TicketID}
                        onClick={() => handleTicketClick(ticket)}
                        className={`cursor-pointer ${
                          selectedTicket === ticket ? "selected-row" : ""
                        }`}
                      >
                        <td>{ticket.TicketID}</td>
                        <td>{ticket.TicketType}</td>
                        <td>
                          {ticket.LeadId ? <>{ticket.LeadId}</> : <>NA</>}
                        </td>
                        <td className="text-green-600">{ticket.Status}</td>
                        {/* <td>{ticket.Description}</td> */}
                        <td>{ticket.Querycategory}</td>
                        <td>{ticket.QuerySubcategory}</td>
                        <td>{ticket.Employee.Location}</td>
                        <td>
                          <p className="bg-red-400 text-center rounded-full">
                            {ticket.TicketUpdates ? (
                              <>{ticket.TicketUpdates.length}</>
                            ) : (
                              <>0</>
                            )}
                          </p>
                        </td>
                        <td>{ticket.Employee.EmployeeName}</td>
                        <td>{ticket.Employee.Department.DepartmentName}</td>
                        <td>{ticket.TicketResTimeInMinutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>

        {DTResolvedickets.length > 0 ? (
          <>
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
                    {/* <th>Description</th> */}
                    <th>Query</th>
                    <th>Sub-Query</th>
                    <th>Location</th>
                    <th>updates</th>
                    <th>From</th>
                    <th>Depat</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>
                  {DTResolvedickets.map((ticket) => (
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
                      <td className="text-blue-800">{ticket.Status}</td>
                      {/* <td>{ticket.Description}</td> */}
                      <td>{ticket.Querycategory}</td>
                      <td>{ticket.QuerySubcategory}</td>
                      <td>{ticket.Employee.Location}</td>
                      <td>
                        <p className="bg-red-400 text-center rounded-full">
                          {ticket.TicketUpdates ? (
                            <>{ticket.TicketUpdates.length}</>
                          ) : (
                            <>0</>
                          )}
                        </p>
                      </td>
                      <td>{ticket.Employee.EmployeeName}</td>
                      <td>{ticket.Employee.Department.DepartmentName}</td>
                      <td>{ticket.TicketResTimeInMinutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <></>
        )}

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
      {selectedTicket ? (
        <>
          <div className="sm:w-full">
            {selectedTicket && selectedTicket.Status === "Pending" && (
              <div
                ref={ticketUpdatesContainerRef}
                className="m-2 p-2 bg-orange-400 border border-gray-300 overflow-y-auto max-h-72"
              >
                <div className="mt-4">
                  <div className="ticket-updates-container">
                    {ticketupdateData.map((update, index) => (
                      <div
                        key={index}
                        className={`ticket-update ${
                          update.EmployeeID ? "receiver" : "sender"
                        }`}
                      >
                        <div className="update-info">
                          <p>{update.UpdateStatus}</p>
                          <p>{update.UpdateDescription}</p>
                        </div>
                        <div className="update-attachments">
                          {update.UpdatedAttachmentUrls ? (
                            <>
                              {update.UpdatedAttachmentUrls.map(
                                (url, index) => (
                                  <img
                                    key={index}
                                    src={url}
                                    onClick={() => handleImageClick(url)}
                                    alt={`Attachment ${index + 1}`}
                                  />
                                )
                              )}
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
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Home;
