import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Application entry point
console.log("ShopCount Ready");
createRoot(document.getElementById("root")!).render(<App />);
