import React from "react";

function Team() {
  return (
    <div className="container mx-auto p-1">
      <div className="p-1 bg-red-200 font-bold text-center">
        Department Dashbord
      </div>
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Total Organization</h4>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-200 p-4 rounded shadow flex justify-around hover:bg-blue-400">
            <div>
              <strong>Ticket</strong>
              <h5 className="font-semibold">1000</h5>
            </div>

            <i className="bi bi-postcard text-4xl"></i>
          </div>
          <div className="bg-green-200 p-4 rounded shadow flex justify-around hover:bg-green-400">
            <div>
              <strong>Resolve</strong>
              <h5 className="font-semibold">983</h5>
            </div>

            <i className="bi bi-journal-check text-4xl"></i>
          </div>
          <div className="bg-red-200 p-4 rounded shadow flex justify-around hover:bg-red-400">
            <div>
              <strong>Pending</strong>
              <h5 className="font-semibold">17</h5>
            </div>

            <i className="bi bi-envelope-paper text-4xl"></i>
          </div>
        </div>
      </div>

      {/* Container 2 with 6 cards */}
      <div className="mb-4">
        <h6 className="font-semibold mb-2">Total Students</h6>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-yellow-200 p-4 rounded shadow flex justify-around hover:bg-yellow-400">
            <div>
              <strong>Ticket</strong>
              <h5 className="font-semibold">1000</h5>
            </div>

            <i className="bi bi-postcard text-4xl"></i>
          </div>

          <div className="bg-pink-200 p-4 rounded shadow flex justify-around hover:bg-pink-400">
            <div>
              <strong>Resolve</strong>
              <h5 className="font-semibold">983</h5>
            </div>

            <i className="bi bi-journal-check text-4xl"></i>
          </div>

          <div className="bg-purple-200 p-4 rounded shadow flex justify-around hover:bg-purple-400">
            <div>
              <strong>Pending</strong>
              <h5 className="font-semibold">17</h5>
            </div>

            <i className="bi bi-envelope-paper text-4xl"></i>
          </div>

          {/* <div className="bg-orange-200 p-4 rounded shadow">Card 4</div>
        <div className="bg-red-200 p-4 rounded shadow">Card 5</div>
        <div className="bg-indigo-200 p-4 rounded shadow">Card 6</div> */}
        </div>
      </div>

      {/* Container 3 with 4 cards */}
      <div>
        <h6 className="font-semibold mb-2">Total Employee</h6>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-teal-200 p-4 rounded shadow flex justify-around hover:bg-teal-400">
            <div>
              <strong>Ticket</strong>
              <h5 className="font-semibold">1000</h5>
            </div>

            <i className="bi bi-postcard text-4xl"></i>
          </div>
          <div className="bg-gray-200 p-4 rounded shadow flex justify-around hover:bg-gray-400">
            <div>
              <strong>Resolve</strong>
              <h5 className="font-semibold">983</h5>
            </div>

            <i className="bi bi-journal-check text-4xl"></i>
          </div>
          <div className="bg-orange-200 p-4 rounded shadow flex justify-around hover:bg-orange-400">
            <div>
              <strong>Pending</strong>
              <h5 className="font-semibold">17</h5>
            </div>

            <i className="bi bi-envelope-paper text-4xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Team;
