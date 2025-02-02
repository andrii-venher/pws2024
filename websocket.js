const websocketMap = {};

module.exports = (wsInstance) => (ws, req) => {
  ws.sessionID = req.sessionID;
  websocketMap[req.sessionID] = ws;

  const handeChatMessage = (data) => {
    req.sessionStore.all((err, sessions) => {
      if (err) {
        console.error("Cannot retrieve sessions");
        return;
      }
      for (const sessionID in sessions) {
        if (
          websocketMap[sessionID] && // chat was opened or not
          sessions[sessionID].passport &&
          sessions[sessionID].passport.user &&
          sessions[sessionID].passport.user == data.to
        ) {
          try {
            websocketMap[sessionID].send(JSON.stringify(data));
          } catch (err) {
            console.error("Websocket send error", err.message);
          }
        }
      }
    });
  };

  const handleProject = (data) => {
    console.log(data);
    req.sessionStore.all((err, sessions) => {
      if (err) {
        console.error("Cannot retrieve sessions");
        return;
      }
      for (const sessionID in sessions) {
        try {
          websocketMap[sessionID].send(JSON.stringify(data));
        } catch (err) {
          console.error("Websocket send error", err.message);
        }
      }
    });
  };

  ws.on("message", (rawData) => {
    let data = {};
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      console.error(err.message, rawData);
      return;
    }
    if (data.type == "chatmessage") {
      handeChatMessage(data);
    }
    if (data.type == "project") {
      handleProject(data);
    }
  });

  ws.on("close", () => {
    delete websocketMap[ws.sessionID];
  });
};
