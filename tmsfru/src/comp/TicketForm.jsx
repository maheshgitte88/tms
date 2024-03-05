import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createTicket } from "../app/features/DepTicketsSlices";

const currentTime = new Date();
const currentDay = new Date();
function TicketForm() {
  const [querys, setQuerys] = useState([]);
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

  const [formData, setFormData] = useState({
    TicketType: getTicketType(currentTime, currentDay), // Default value from local storage
    Status: "Pending", // Initial status
    Description: "",
    LeadId: "",
    AssignedToDepartmentID: 1,
    AssignedToSubDepartmentID: 4,
    files: null, // Change to null for initial state
    EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID, // EmployeeID from user object in local storage
  });

  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      files: e.target.files,
    });
    setAttchedfiles(e.target.files);
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const formDataObj = new FormData();
  //   for (const key in formData) {
  //     formDataObj.append(key, formData[key]);
  //   }
  //   for (const file of formData.files) {
  //     formDataObj.append("files", file);
  //   }

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:2000/Ticket/Create",
  //       formDataObj,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data", // Ensure correct content type for file uploads
  //         },
  //       }
  //     );
  //     console.log(response.data); // Handle success response
  //   } catch (error) {
  //     console.error(error); // Handle error response
  //   }
  // };

  const FetchQueryData = async () => {
    try {
      const queryRes = await axios.get(
        `http://localhost:2000/Query/get-query-hierarchy`
      );
      if (queryRes.data) {
        setQuerys(queryRes.data);
        populateDepartments(queryRes.data); // Call populateDepartments after data is fetched
      } else {
        console.error("Error: Query data is missing");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    FetchQueryData();
  }, []);

  const populateDepartments = (queryData) => {
    if (queryData && queryData.length > 0) {
      const departmentOptions = queryData.map((dep) => (
        <option key={dep.DepartmentId} value={dep.DepartmentId}>
          {dep.DepartmentName}
        </option>
      ));
      setDepartments(departmentOptions);
    }
  };

  const populateCategories = (selectedDepartment) => {
    setSelectedDepartment(selectedDepartment);
    const department = querys.find(
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
    const department = querys.find(
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
    // Adjust currentTime to Indian Standard Time (IST)
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
  // const user = JSON.parse(localStorage.getItem("user"));

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  // const formDataObj = new FormData();

  // for (const file of attchedfiles) {
  //   formData.append("files", file);
  // }
  //   try {
  //     const currentTime = new Date();
  //     const currentDay = new Date();

  //     const ticketType = getTicketType(currentTime, currentDay);
  //     const formData = {
  //       Description: description,
  //       AssignedToDepartmentID: ticketAsgDepId,
  //       AssignedToSubDepartmentID: ticketAsgSubDepId,
  //       Querycategory: selectedCategory,
  //       QuerySubcategory: selectedSubcategory,
  //       TicketResTimeInMinutes: Number(queryResTime),
  //       TicketType: ticketType,
  //       Status: "Pending",
  //       files:attchedfiles,
  //       EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID,
  //     };

  //     dispatch(createTicket(formData));
  //   } catch (error) {
  //     console.error("Error creating ticket:", error);
  //   }
  // };



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
  
          const response = await axios.post("http://localhost:2000/api/img-save",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log(response,2332)
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
        files: updatedAttachmentUrls, // Send file URLs instead of actual files
        EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID,
      };
  
      // Dispatch createTicket action with form data
      dispatch(createTicket(formDataToSend));
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
                  required
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

        {showSeslsForm && (
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
        )}
      </div>
    </>
  );
}

export default TicketForm;
