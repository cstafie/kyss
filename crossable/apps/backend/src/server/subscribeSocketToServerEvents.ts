import theServerManager from "./server_manager";
import User from "../user/user";

export default function subscribeUserToServerEvents(user: User) {
  user.socket.on("newGame", (name: string) => {
    theServerManager.newGame(name, user);
    theServerManager.updateGamesList();
  });
  user.socket.on("joinGame", (gameId: string) => {
    theServerManager.joinGame(gameId, user);
    theServerManager.updateGamesList();
  });
  user.socket.on("leaveGame", () => {
    theServerManager.leaveGame(user);
    theServerManager.updateGamesList();
  });
  user.socket.on("disconnect", () => {
    theServerManager.disconnect(user);
    theServerManager.updateGamesList();
  });
}
