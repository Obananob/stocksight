console.log("Main entry point loading...");
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Rendering App component...");
createRoot(document.getElementById("root")!).render(<App />);
