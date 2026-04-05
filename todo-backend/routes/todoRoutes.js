import express from "express";
import Todo from "../models/Todo.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    const newTodo = new Todo({
      text,
      user: req.user.id,
    });

    const savedTodo = await newTodo.save();

    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/clear-completed", authMiddleware, async (req, res) => {
  try {
    await Todo.deleteMany({ completed: true, user: req.user.id });

    res.json({ message: "Completed todos cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTodo = await Todo.findByIdAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;

    const updateFields = {};

    if (text !== undefined) updateFields.text = text;
    if (completed !== undefined) updateFields.completed = completed;

    const updatedTodo = await Todo.findByIdAndUpdate(
      { _id: id, user: req.user.id },
      updateFields,
      {
        new: true,
      },
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
