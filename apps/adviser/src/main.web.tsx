import React from "react";
import {createRoot} from "react-dom/client";
import AndroidApp from "./DemoLauncher";
import "./web.css";
createRoot(document.getElementById("root")!).render(<AndroidApp/>);
