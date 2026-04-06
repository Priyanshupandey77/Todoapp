import { useEffect, useState } from "react";
import "../App.css";
import TodoInput from "../components/InputTodo.jsx";

function Dashboard() {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("all");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true); //

  // Get backend URL from env
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTodos = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/todos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.reload();
          return;
        }

        const data = await res.json();
        setTodos(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchTodos, 50);
    return () => clearTimeout(timeout);
  }, []);

  function addTodo(text) {
    if (!text.trim()) return;
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    })
      .then((res) => res.json())
      .then((newTodo) => {
        setTodos((prev) => [...prev, newTodo]);
      });
  }

  function deleteTodo(id) {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/todos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => {
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    });
  }

  async function toggleTodo(id) {
    const token = localStorage.getItem("token");
    const todo = todos.find((t) => t._id === id);

    const res = await fetch(`${API_URL}/api/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed: !todo.completed }),
    });

    const updated = await res.json();

    setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
  }

  async function editTodo() {
    if (!editText.trim()) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/todos/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: editText }),
    });

    const updated = await res.json();

    setTodos((prev) => prev.map((t) => (t._id === editingId ? updated : t)));

    setEditingId(null);
    setEditText("");
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  async function clearCompleted() {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/api/todos/clear-completed`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1 className="title">Todo App</h1>
      <button onClick={logout} className="logout-btn">
        Logout
      </button>

      <div className="container">
        <TodoInput addTodo={addTodo} />

        <div className="filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
          <button className="clear-btn" onClick={clearCompleted}>
            Clear Completed
          </button>
        </div>

        <ul className="todo-list">
          {filteredTodos.length === 0 ? (
            <p className="empty">No tasks here ✨</p>
          ) : (
            filteredTodos.map((todo) => (
              <li
                key={todo._id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
              >
                {editingId === todo._id ? (
                  <div className="edit-box">
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button onClick={editTodo}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <span onClick={() => toggleTodo(todo._id)}>
                      {todo.text}
                    </span>

                    <div className="actions">
                      <button
                        onClick={() => {
                          setEditingId(todo._id);
                          setEditText(todo.text);
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => deleteTodo(todo._id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}

export default Dashboard;