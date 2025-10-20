// export function subscribeToServerEvents(
//   socket: Socket<ClientToServerEvents, ServerToClientEvents>,
//   serverManager: ServerManager
// ) {
//   socket.on("joinServer", (userInfo: { id: string; name: string }) => {
//     serverManager.joinServer({ id: userInfo.id, name: userInfo.name, socket });
//   });
// }

// export function subscribeToGameEvents(
//   socket: Socket<ClientToServerEvents, ServerToClientEvents>,
//   gameManager: GameManager,
//   user: User
// ) {
//   socket.on("createGame", (settings: GameSettings) => {
//     gameManager.createGame(user, settings);
//   });
// }
