import { StrictMode } from "react";
import { enableMapSet } from "immer";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/app";
import UserContextProvider from "@/contexts/user/provider";
import GameContextProvider from "@/contexts/game/provider";
import "./main.css";

enableMapSet();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <UserContextProvider>
        <GameContextProvider>
          <App />
        </GameContextProvider>
      </UserContextProvider>
    </BrowserRouter>
  </StrictMode>
);
