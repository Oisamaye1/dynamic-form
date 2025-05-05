import ReactDOM from "react-dom"
import DynamicForm from "./components/DynamicForm"
import "./styles/main.css"
import "./iframe-resize" // Import the iframe resize script

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("dynamic-form-container")

  if (container) {
    ReactDOM.render(<DynamicForm />, container)
  }
})
