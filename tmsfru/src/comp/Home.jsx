import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import io from "socket.io-client";
import Reply from "./Reply";
import { useDispatch, useSelector } from "react-redux";
import addNotification from 'react-push-notification';

import {
  getDepTicket,
  updateDeptTicket,
  updateDtTicketUpdate,
  updateTicket,
} from "../app/features/DepTicketsSlices";
import axios from "axios";
function Home() {
  // const socket = io.connect("http://localhost:2000");
  const user = JSON.parse(localStorage.getItem("user"));

  const socket = useMemo(() => io("http://localhost:2000"), []);

  const { DTickets, loading } = useSelector((state) => state.app);
  console.log(DTickets, 23);
  const [notificationPermission, setNotificationPermission] =useState("default");
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

    // Assuming you have the ticketId available
    if (AssignedToSubDepartmentID) {
      socket.emit("joinDepaTicketRoom", AssignedToSubDepartmentID);
    }

    // return () => {
    //   socket.off("updatedDeptTicketChat");
    // };
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
    const dpId = user.DepartmentID;
    const SubDapId = user.SubDepartmentID;
    dispatch(getDepTicket({ departmentId: dpId, SubDepartmentId: SubDapId }));
  }, []);

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
      console.log(data.TicketUpdates, 124124);
      dispatch(updateDtTicketUpdate(data.TicketUpdates));
      setTicketUpdateData((prevChat) => [...prevChat, data.TicketUpdates]);

      showNotification(data);
      addNotification({
        title: 'Warning',
        subtitle: 'This is a subtitle',
        message: 'This is a very long message',
        theme: 'darkblue',
        native: true // when using native, your OS will handle theming.
    });
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
  }, [DTickets, socket]);

  console.log(notificationPermission, 168)

  const showNotification = (data) => {
    console.log(data, 828282);
    if (notificationPermission === "granted") {
      const { TicketUpdates, TicketIDasRoomId } = data;
      const notificationTitle = `Ticket Update`;
      console.log( `Ticket ${TicketIDasRoomId} has ${TicketUpdates.UpdateDescription} updates.`)
      const notificationBody = `Ticket ${TicketIDasRoomId} has ${TicketUpdates.UpdateDescription} updates.`;
      const notification = new Notification(notificationTitle, {
        body: notificationBody,
      });

      notification.onclick = () => {
        console.log("Notification clicked");
        // Handle notification click event (e.g., navigate to ticket details)
      };
    }
  };

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
          <table
            className={`custom-table ${selectedTicket ? "selected-table" : ""}`}
          >
            <thead>
              <tr>
                <th>Id</th>
                <th>T-Type</th>
                <th>Lead-Id</th>
                <th>Status</th>
                <th>Description</th>
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
                  <td>{ticket.Description}</td>
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
