import { useState } from "react";

export default function TodoInput({addTodo}) {
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!input.trim()) return;

    addTodo(input);
    setInput("");
  }

  return (
    <form onSubmit={handleSubmit} className="todo-input-container">
      
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter task..."
        />
        <button>Add</button>
      
    </form>
  );
}
