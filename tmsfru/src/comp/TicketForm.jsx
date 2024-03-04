import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {createTicket} from '../app/features/DepTicketsSlices'
function TicketForm() {
  const [querys, setQuerys] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState();

  const dispatch = useDispatch();

  console.log(
    selectedDepartment,
    selectedCategory,
    selectedSubcategory,
    description,
    166
  );
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
        <option key={cat.QueryCategoryId} value={cat.QueryCategoryId}>
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
            key={subcat.QueryCategoryID}
            value={subcat.QuerySubCategoryID}
          >
            {subcat.QuerySubcategoryName}
          </option>
        ));
        setSubcategories(subcategoryOptions);
        setSelectedCategory(category.QueryCategoryID); // Store the selected category ID
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentTime = new Date();
      const currentDay = new Date();

      const ticketType = getTicketType(currentTime, currentDay);

      // Find the selected department
      const selectedDepartmentObj = querys.find(
        (dep) => dep.DepartmentName === selectedDepartment
      );

      // Find the selected category
      const selectedCategoryObj =
        selectedDepartmentObj &&
        selectedDepartmentObj.QueryCategories.find(
          (cat) => cat.QueryCategoryID === selectedCategory
        );

      // Find the selected subcategory
      const selectedSubcategoryObj =
        selectedCategoryObj &&
        selectedCategoryObj.QuerySubcategories.find(
          (subcat) => subcat.QueryCategoryID === selectedSubcategory
        );

      // Extract department and sub-department IDs
      const assignedToDepartmentID = selectedCategoryObj
        ? selectedCategoryObj.DepartmentId
        : null;
      const assignedToSubDepartmentID = selectedCategoryObj
        ? selectedCategoryObj.SubDepartmentID // This line had a typo, it should be SubDepartmentID instead of SubDepartmentID
        : null;

      console.log(
        selectedDepartmentObj,
        selectedCategoryObj,
        selectedSubcategoryObj,
        assignedToDepartmentID,
        assignedToSubDepartmentID,
        145
      );
      // Check if assignedToDepartmentID and assignedToSubDepartmentID are valid
      if (
        assignedToDepartmentID !== null &&
        assignedToSubDepartmentID !== null
      ) {
     
        const formData = {
          Description: description,
          AssignedToDepartmentID: assignedToDepartmentID,
          AssignedToSubDepartmentID: assignedToSubDepartmentID,
          QuerycategoryID: selectedCategory, // Double-check this if it's correct
          QuerySubcategoryID: Number(selectedSubcategory), // Double-check this if it's correct
          TicketType: ticketType,
          Status: "Pending",
          EmployeeID: JSON.parse(localStorage.getItem("user")).EmployeeID,
        };
        dispatch(createTicket(formData))
        // Make a POST request to your backend API to create the ticket
        // const response = await axios.post(
        //   "http://localhost:2000/Ticket/create-ticket",
        //   formData
        // );

        // Handle success response
        // console.log("Ticket created successfully:", response.data);
      } else {
        console.error("Error: Department or sub-department not selected");
      }
    } catch (error) {
      // Handle error
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
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
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
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Generate Ticket
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default TicketForm;
