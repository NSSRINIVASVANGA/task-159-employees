const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());


const MONGO_URI = "mongodb+srv://vanganataraj787:vanga2002@ex-pro.3x3dv.mongodb.net/?retryWrites=true&w=majority&appName=ex-pro";

// Connect to MongoDB Atlas
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Employee Schema
const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hoursWorked: { type: Number, required: true },
  tasksCompleted: { type: Number, required: true },
  timeSpent: { type: Number, required: true },
});

const Employee = mongoose.model("Employee", EmployeeSchema);

// API Endpoints
app.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

app.get("/employees/:name", async (req, res) => {
  try {
    const employee = await Employee.findOne({ name: req.params.name });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee data" });
  }
});

// app.post("/employees", async (req, res) => {
//   try {
//     const newEmployee = new Employee(req.body);
//     await newEmployee.save();
//     res.status(201).json({ message: "Employee added successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to add employee" });
//   }
// });

app.post("/employees", async (req, res) => {
    try {
      const { name, hoursWorked, tasksCompleted, timeSpent } = req.body;
  
      // Find the existing employee by name
      const existingEmployee = await Employee.findOne({ name });
  
      if (existingEmployee) {
        // Update the existing employee's property values by adding the new data
        existingEmployee.hoursWorked += hoursWorked;
        existingEmployee.tasksCompleted += tasksCompleted;
        existingEmployee.timeSpent += timeSpent;
  
        // Save the updated employee
        await existingEmployee.save();
        return res.status(200).json({ message: "Employee data updated successfully", employee: existingEmployee });
      }
  
      // If no employee is found, create a new one
      const newEmployee = new Employee({ name, hoursWorked, tasksCompleted, timeSpent });
      await newEmployee.save();
      res.status(201).json({ message: "Employee added successfully", employee: newEmployee });
    } catch (err) {
      res.status(500).json({ error: "Failed to process employee data" });
    }
  });
  

app.get("/recommendations", async (req, res) => {
  try {
    const employees = await Employee.find();
    const avgTasksCompleted =
      employees.reduce((sum, emp) => sum + emp.tasksCompleted, 0) / employees.length;

    let recommendation = "";
    if (avgTasksCompleted > 25) {
      recommendation = "Employees are highly productive. Keep up the good work!";
    } else if (avgTasksCompleted > 15) {
      recommendation = "Employees are performing well, but there is room for improvement.";
    } else {
      recommendation = "Consider implementing strategies to boost productivity.";
    }

    res.status(200).json({ recommendation });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
