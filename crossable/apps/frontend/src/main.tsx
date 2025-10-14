import { StrictMode } from "react";
import { enableMapSet } from "immer";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/app";
import AuthContextProvider from "@/contexts/auth/provider";
import SocketContextProvider from "@/contexts/socket/provider";
import "./main.css";

enableMapSet();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <SocketContextProvider>
          <App />
        </SocketContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
);
