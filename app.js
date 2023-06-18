const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/taskDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB database");
});

// Define the Task schema
const taskSchema = new mongoose.Schema({
  task_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
},{ versionKey: false });

const Task = mongoose.model("Task", taskSchema);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Create a new task
app.post("/tasks", async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = new Task({ task_id:uuidv4(), title, description });
    await task.save();
    return res.status(201).json({
      message: "Task created successfully",
      status_code: 201,
      data: task
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
      status_code: 500,
      data: null,
    });
  }
});

// Get all tasks with pagination and filtering
app.get("/tasks", async (req, res) => {
  try {
    // const { page = 1, pageSize = 10, name: title = "",  } = req.query;

    // const limit = +pageSize;
    // const skip = (+page - 1) * limit;
    // const query = {};

    // if (title) {
    //   query.name = { $regex: title, $options: "i" }; // Case-insensitive matching
    // }

    // const totalTasks = await Task.countDocuments(query);
    // const totalPages = Math.ceil(totalTasks / limit);

    const tasks = await Task.find({ })
      // .skip(skip)
      // .limit(limit)
      // .exec();

    res.status(200).json({
      data: tasks,
      status_code:200,
      // result: tasks.length,
      // page: parseInt(page),
      // pageSize: limit,
      // totalPages: totalPages,
      // totalTasks: totalTasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving tasks");
  }
});

// Get a task by ID
app.get("/tasks/:id", (req, res) => {
  const task_id = req.params.id;
  Task.findOne({ task_id })
    .exec()
    .then((task) => {
      if (!task) {
        res.status(404).json({
          message: "Task not found",
          status_code: 404,
          data: null,
        });
      } else {
        res.json({ message: "success", status_code: 200, data: task });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving task");
    });
});

// Update a task by ID
app.put("/tasks/:id", async (req, res) => {
  try {
    const task_id = req.params.id;
    const { title, description } = req.body;
    const updatedTask = await Task.findOneAndUpdate(
      { task_id },
      { title, description },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
        status_code: 404,
        data: null,
      });
    } else {
      return res.status(202).json({
        message: "success",
        status_code: 202,
        data: updatedTask,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error updating task");
  }
});

// Delete a task by ID
app.delete("/tasks/:id", async (req, res) => {
  try {
    const task_id = req.params.id;
    const deletedTask = await Task.findOneAndRemove({ task_id });

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
        status_code: 404,
        data: null,
      });
    } else {
      return res.status(200).json({
        message: "success",
        status_code: 200,
        data: deletedTask,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error deleting task");
  }
});

// Start the server
app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
