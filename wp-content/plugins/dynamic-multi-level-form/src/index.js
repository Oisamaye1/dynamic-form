import ReactDOM from "react-dom"
import DynamicForm from "./components/DynamicForm"
import "./styles/main.css"

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("dynamic-form-container")

  if (container) {
    ReactDOM.render(<DynamicForm />, container)
  }
})
