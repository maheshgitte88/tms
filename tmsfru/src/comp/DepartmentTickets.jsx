import React from 'react'

function DepartmentTickets({data}) {
    return (
        <div>


<h2>Ticket Table:</h2>
      <table>
        <thead>
          <tr>
            <th>Ticket Type</th>
            <th>Status</th>
            <th>Description</th>
            <th>AttachmentUrl</th>
            <th>Employee Name</th>
            <th>Department Name</th>
            <th>Resolution Status</th>
            <th>Resolution Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ticket) => (
            <tr key={ticket.TicketID}>
              <td>{ticket.TicketType}</td>
              <td>{ticket.Status}</td>
              <td>{ticket.Description}</td>
              <td>{ticket.AttachmentUrl}</td>
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


            DepartmentTickets
            <p>bucket count Live update and render in Table update ticket automatick using webscoket</p>
            <br />
            Table half - t from name- lead(focus) - copy btn - Title Genrate time  - remeing Time in minitus & seconds  & on click on ticket open
            in half part of desktop in that option to reply and if need any thing or solve Parller update into table and goes to solved bucket and update count   || ticket in half
            <br />
            Double and duplicate Ticket track in Red color for day time
        </div>
    )
}

export default DepartmentTickets