const express = require("express");
const TaskModel = require("../Schema/Task");
const { userAuth } = require("../connections/middleware/auth");
const taskRouter = express.Router();

taskRouter.post("/createTask", userAuth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Enter the title of the task.",
      });
    }

    const newTask = new TaskModel({
      title,
      description,
      status,
      priority,
      dueDate,
      createdBy: req.user._id,
    });

    await newTask.save();

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    console.log("error in login user", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

taskRouter.patch("/updateTask/:id", userAuth, async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedData = req.body;

    const updatedTask = await TaskModel.findOneAndUpdate(
      {
        _id: taskId,
        createdBy: req.user._id,
        isDeleted: { $ne: true },
      },
      { ...updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.log("error in updating Task", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

taskRouter.get("/getAllTasks", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const [tasks, totalTasks] = await Promise.all([
      TaskModel.find(
        {
          createdBy: loggedInUserId,
          isDeleted: { $ne: true },
        },
        { isDeleted: 0, deletedAt: 0, __v: 0 }
      )
        // .select("-isDeleted -deletedAt -__v")
        .sort({ createdAt: -1 }),

      TaskModel.countDocuments({
        createdBy: loggedInUserId,
        isDeleted: { $ne: true },
      }),
    ]);

    if (totalTasks === 0) {
      return res.status(200).json({
        success: true,
        message: "No Task found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: {
        totalTasks,
        tasks,
      },
    });
  } catch (error) {
    console.log("Error fetching tasks:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

taskRouter.patch("/deleteTask/:id", userAuth, async (req, res) => {
  try {
    const taskId = req.params.id;

    const deletedTask = await TaskModel.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Unable to delete",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task Deleted successfully",
      data: deletedTask,
    });
  } catch (error) {
    console.log("error in updating Task", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = taskRouter;
