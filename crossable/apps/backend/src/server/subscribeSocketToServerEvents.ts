import { type ClientToServerEvents, type ServerToClientEvents } from "shared";
import { Socket } from "socket.io";
import theServerManager from "./server_manager";
import User from "../user/user";

export default function subscribeSocketToServerEvents(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  user: User
) {
  socket.on("newGame", (name: string) => {
    theServerManager.newGame(name, user);
    theServerManager.updateGamesList();
  });
  socket.on("joinGame", (gameId: string) => {
    theServerManager.joinGame(gameId, user);
    theServerManager.updateGamesList();
  });
  socket.on("leaveGame", () => {
    theServerManager.leaveGame(user);
    theServerManager.updateGamesList();
  });
  socket.on("disconnect", () => {
    theServerManager.disconnect(user);
    theServerManager.updateGamesList();
  });
}
