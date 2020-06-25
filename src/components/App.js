import React from "react";
import "../styles.css";
import Tasks from "./Tasks";
import TaskForm from "./TaskForm";

function App() {
  return (
    <div className="App">
      <h1>Tasks</h1>
      <TaskForm />
      <Tasks />
    </div>
  );
}

export default App;
