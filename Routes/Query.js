const express = require('express');
const router = express.Router();
const QueryCategory = require('../models/QueryCategory');
const QuerySubcategory = require('../models/QuerySubcategory');
const SubDepartment = require('../models/SubDepartment');
const Department = require('../models/Department');


router.post('/add-dep-querys', async (req, res) => {
  try {
      // Extract data from request body
      const data = req.body;

      // Loop through the provided data and save it into the database
      for (const item of data) {
          // Save Department
          const department = await Department.create({
              DepartmentName: item.DepartmentName,
          });

          // Save SubDepartment
          const subDepartment = await SubDepartment.create({
              SubDepartmentName: item.SubDepartmentName,
              DepartmentId: department.DepartmentID,
          });

          // Save QueryCategory
          const queryCategory = await QueryCategory.create({
              QueryCategoryName: item.QueryCategoryName,
              DepartmentId: department.DepartmentID,
              SubDepartmentID: subDepartment.SubDepartmentID,
          });

          // Save QuerySubcategory
          const querySubcategory = await QuerySubcategory.create({
              QuerySubcategoryName: item.QuerySubcategoryName,
              QueryCategoryId: queryCategory.QueryCategoryID,
          });
      }

      res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// router.get('/get-query-hierarchy', async (req, res) => {
//   try {
//     // Fetch all Departments
//     const departments = await Department.findAll({
//       include: [
//         {
//           model: SubDepartment,
//           include: [
//             {
//               model: QueryCategory,
//               include: [
//                 {
//                   model: QuerySubcategory
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     });

//     res.status(200).json(departments);
//   } catch (error) {
//     console.error('Error fetching hierarchy:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


router.get('/get-query-hierarchy', async (req, res) => {
  try {
    // Fetch all Departments
    const departments = await Department.findAll({
      include: [
        {
          // model: SubDepartment,
          // include: [
          //   {
              model: QueryCategory,
              include: [
                {
                  model: QuerySubcategory
                }
              ]
          //   }
          // ]
        }
      ]
    });

    res.status(200).json(departments);
  } catch (error) {
    console.error('Error fetching hierarchy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/categories/:QueryCategoryID', async (req, res) => {
    try {
      const QueryCategoryID = req.params.QueryCategoryID;
      const categoriesWithSubcategories = await QueryCategory.findAll({
        where: {QueryCategoryID: QueryCategoryID},
        include: [{ model: QuerySubcategory}],
      });
      res.json(categoriesWithSubcategories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.get('/categories', async (req, res) => {
    try {
      const categoriesWithSubcategories = await QueryCategory.findAll({
        include: [{ model: QuerySubcategory}]
      });
      res.json(categoriesWithSubcategories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
router.post('/categories', async (req, res) => {
    try {
      const { categories } = req.body;
  
      if (!Array.isArray(categories)) {
        return res.status(400).json({ error: 'Invalid request body format. Expected an array of categories.' });
      }
  
      const createdCategories = await Promise.all(
        categories.map(async ({ name, subcategories }) => {
          // Create a new category
          const newCategory = await QueryCategory.create({ name });
      
          // Check if subcategories are provided
          if (subcategories && Array.isArray(subcategories)) {
            // Create subcategories one by one with the associated category ID
            await Promise.all(
              subcategories.map(async (subcategoryName) => {
                await QuerySubcategory.create({
                  name: subcategoryName,
                  QueryCategoryId: newCategory.QueryCategoryID, // Assuming the foreign key field name is QueryCategoryID
                });
              })
            );
          }
      
          return newCategory;
        })
      );
  
      res.json(createdCategories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });





module.exports = router;
