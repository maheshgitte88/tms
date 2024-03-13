import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  createTicket,
  updateEmpTicket,
} from "../app/features/EmpTicketsSlices";
import { QueryCatSubHierarchyData } from "../app/features/QueryDataSlices";
import { io } from "socket.io-client";

const currentTime = new Date();
const currentDay = new Date();
function TicketForm() {
  const [showForm, setShowForm] = useState(false);
  const [showSeslsForm, setShowSealsForm] = useState(false);
  const [attchedfiles, setAttchedfiles] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [queryResTime, setQueryResTime] = useState(null);
  const [ticketAsgDepId, setTicketAssigDpId] = useState(null);
  const [ticketAsgSubDepId, setTicketAssigSubDpId] = useState(null);

  const socket = useMemo(() => io("http://localhost:2000"), []);

  const [formData, setFormData] = useState({
    TicketType: getTicketType(currentTime, currentDay),
    Status: "Pending", // Initial status
    Description: "",
    LeadId: "",
    TicketResTimeInMinutes: 15,
    AssignedToDepartmentID: 1,
    AssignedToSubDepartmentID: 4,
    // files: null, // Change to null for initial state
    EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID, // EmployeeID from user object in local storage
  });

  const dispatch = useDispatch();

  const { QueryCatSubHierarchy, loading } = useSelector(
    (state) => state.QueryCatSubHierarchy
  );

  useEffect(() => {
    socket.on("updatedDeptTicketChat", (data) => {
      dispatch(updateEmpTicket(data));
    });

    // Assuming you have the ticketId available
    if (formData.AssignedToSubDepartmentID) {
      socket.emit("joinDepaTicketRoom", formData.AssignedToSubDepartmentID);
    }
    if (ticketAsgSubDepId) {
      socket.emit("joinDepaTicketRoom", ticketAsgSubDepId);
    }

    // return () => {
    //   socket.off("updatedTicketChat");
    // };
  }, [socket, ticketAsgSubDepId, formData.AssignedToSubDepartmentID]);

  // const filteredData = QueryCatSubHierarchy.filter((e) => e.DepartmentName === "IT");
  const filteredData = QueryCatSubHierarchy.filter(
    (department) => department.DepartmentName === "IT"
  ).map((department) => {
    return {
      ...department,
      QueryCategories: department.QueryCategories.filter(
        (category) =>
          category.QueryCategoryName === "Lead Transfer" ||
          category.QueryCategoryName === "Extraa Edge"
      ),
    };
  });

  const handleCategorySelect = (categoryName) => {
    setFormData({
      ...formData,
      Querycategory: categoryName,
    });
  };

  const handleSubcategorySelect = (subcategoryName) => {
    setFormData({
      ...formData,
      QuerySubcategoryName: subcategoryName,
    });
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      AttachmentUrl: e.target.files,
    });
    setAttchedfiles(e.target.files);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedAttachmentUrls = await getAttachmentUrls(
        formData.AttachmentUrl
      );
      setFormData((prevFormData) => ({
        ...prevFormData,
        AttachmentUrl: updatedAttachmentUrls,
      }));

      socket.emit("createTicket", {
        createTicket: formData,
        AssigSubDepId: formData.AssignedToSubDepartmentID,
      });
      // dispatch(createTicket(formData));
    } catch (error) {
      console.error(error);
    }
  };

  // Function to get attachment URLs from the API
  const getAttachmentUrls = async (files) => {
    try {
      const urls = [];
      if (files) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          const response = await axios.post(
            "http://localhost:2000/api/img-save",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          urls.push(response.data.data);
        }
        return urls;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching attachment URLs:", error);
      throw error;
    }
  };

  useEffect(() => {
    dispatch(QueryCatSubHierarchyData());
    populateDepartments(QueryCatSubHierarchy);
  }, [showForm]);
  const populateDepartments = (QueryCatSubHierarchy) => {
    if (QueryCatSubHierarchy && QueryCatSubHierarchy.length > 0) {
      const departmentOptions = QueryCatSubHierarchy.map((dep) => (
        <option key={dep.DepartmentId} value={dep.DepartmentId}>
          {dep.DepartmentName}
        </option>
      ));
      setDepartments(departmentOptions);
    }
  };
  const populateCategories = (selectedDepartment) => {
    setSelectedDepartment(selectedDepartment);
    const department = QueryCatSubHierarchy.find(
      (dep) => dep.DepartmentName === selectedDepartment
    );
    if (department) {
      const categoryOptions = department.QueryCategories.map((cat) => (
        <option key={cat.QueryCategoryId} value={cat.QueryCategoryName}>
          {cat.QueryCategoryName}
        </option>
      ));
      setCategories(categoryOptions);
    }
  };

  const populateSubcategories = (selectedCategory) => {
    const department = QueryCatSubHierarchy.find(
      (dep) => dep.DepartmentName === selectedDepartment
    );
    if (department) {
      const category = department.QueryCategories.find(
        (cat) => cat.QueryCategoryName === selectedCategory
      );
      if (category) {
        const subcategoryOptions = category.QuerySubcategories.map((subcat) => (
          <option
            key={subcat.QuerySubCategoryID}
            value={subcat.QuerySubcategoryName}
            data-time={subcat.TimeInMinutes} // Store the time as a data attribute
          >
            {subcat.QuerySubcategoryName}
          </option>
        ));
        setSubcategories(subcategoryOptions);
        setSelectedCategory(category.QueryCategoryName);
        setTicketAssigDpId(category.DepartmentId);
        setTicketAssigSubDpId(category.SubDepartmentID);
      }
    }
  };

  function getTicketType(currentTime, currentDay) {
    const currentTimeIST = new Date(
      currentTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const hours = currentTimeIST.getHours();
    const day = currentDay.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6

    if (hours >= 10 && hours < 17 && day >= 1 && day <= 5) {
      return "normal"; // Ticket created between 10 am to 5 pm on weekdays
    } else {
      return "OverNight"; // Ticket created after 5 pm or before 10 am, or on weekends
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const currentTime = new Date();
      const currentDay = new Date();

      const ticketType = getTicketType(currentTime, currentDay);

      let updatedAttachmentUrls = [];
      if (attchedfiles && attchedfiles.length > 0) {
        for (const file of attchedfiles) {
          const formData = new FormData();
          formData.append("files", file);

          const response = await axios.post(
            "http://localhost:2000/api/img-save",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log(response, 2332);
          updatedAttachmentUrls.push(response.data.data);
        }
      }

      // Create form data to be sent to the server
      const formDataToSend = {
        Description: description,
        AssignedToDepartmentID: ticketAsgDepId,
        AssignedToSubDepartmentID: ticketAsgSubDepId,
        Querycategory: selectedCategory,
        QuerySubcategory: selectedSubcategory,
        TicketResTimeInMinutes: Number(queryResTime),
        TicketType: ticketType,
        Status: "Pending",
        AttachmentUrl: updatedAttachmentUrls, // Send file URLs instead of actual files
        EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID,
      };
      socket.emit("createTicket", {
        createTicket: formDataToSend,
        AssigSubDepId: ticketAsgSubDepId,
      });
      // Dispatch createTicket action with form data
      // dispatch(createTicket(formDataToSend));
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  return (
    <>
      <div className="container mx-auto mt-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          {showForm ? "Hide Form" : "Generate Ticket"}
        </button>
        {showForm && (
          <div className="max-w-md mx-auto p-8 bg-white rounded shadow-md">
            <h1 className="text-2xl mb-4">Generate Ticket</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="department"
                  className="block text-sm font-bold mb-2"
                >
                  Department
                </label>
                <select
                  name="department"
                  id="department"
                  className="w-full px-3 py-2 border rounded"
                  onChange={(e) => populateCategories(e.target.value)}
                >
                  <option value="" disabled selected>
                    Select Department
                  </option>
                  {departments}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-bold mb-2"
                >
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  className="w-full px-3 py-2 border rounded"
                  onChange={(e) => populateSubcategories(e.target.value)}
                >
                  <option value="" disabled selected>
                    Select Category
                  </option>
                  {categories}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="subcategory"
                  className="block text-sm font-bold mb-2"
                >
                  Subcategory
                </label>

                <select
                  name="subcategory"
                  id="subcategory"
                  className="w-full px-3 py-2 border rounded"
                  onChange={(e) => {
                    setSelectedSubcategory(e.target.value);
                    const selectedTime =
                      e.target.selectedOptions[0].getAttribute("data-time");
                    setQueryResTime(selectedTime); // Set the queryResTime when subcategory changes
                  }}
                >
                  <option value="" disabled selected>
                    Select Subcategory
                  </option>
                  {subcategories}
                </select>
              </div>

              <div className="mb-4">
                <textarea
                  id="description"
                  name="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter a brief description"
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
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted file types: .jpg, .jpeg, .png, .gif, .pdf
                </p>
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Create Ticket
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setShowSealsForm(!showSeslsForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          {showSeslsForm ? "Hide Form" : "Lead Tickets"}
        </button>

        <>
          {showSeslsForm && (
            <form
              onSubmit={handleLeadSubmit}
              className="max-w-lg mx-auto p-1 bg-white rounded-lg shadow-md"
            >
              <div className="mb-4">
                <div className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300">
                  <ul className="flex justify-between">
                    {filteredData.map((department) =>
                      department.QueryCategories.map((category) => (
                        <li
                          key={category.QueryCategoryID}
                          onClick={() =>
                            handleCategorySelect(category.QueryCategoryName)
                          }
                          className={`px-5 cursor-pointer ${
                            formData.Querycategory ===
                            category.QueryCategoryName
                              ? "bg-blue-200" // Change background color for selected category
                              : ""
                          }`}
                        >
                          {category.QueryCategoryName}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {formData.Querycategory && (
                <div className="mb-4">
                  <select
                    id="querySubcategory"
                    name="QuerySubcategory" // Adjusted to QuerySubcategory
                    value={formData.QuerySubcategory}
                    onChange={handleChange} // Changed to handleChange
                    className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="">Select Query Subcategory</option>
                    {QueryCatSubHierarchy.map((department) =>
                      department.QueryCategories.find(
                        (category) =>
                          category.QueryCategoryName === formData.Querycategory
                      )?.QuerySubcategories.map((subcategory) => (
                        <option
                          key={subcategory.QuerySubCategoryID}
                          value={subcategory.QuerySubcategoryName}
                          onClick={() =>
                            handleSubcategorySelect(
                              subcategory.QuerySubcategoryName
                            )
                          } // Added onClick to set subcategory
                        >
                          {subcategory.QuerySubcategoryName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
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
          )}
        </>
      </div>
    </>
  );
}

export default TicketForm;
