import * as http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const chatSever = http.createServer();
const io = new Server(chatSever, {
  cors: {
    // origin: "*",
    origin: ["http://localhost:5173", "https://admin.socket.io"],
  },
});

instrument(io, { auth: false });

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);
  //creates a persistent id for the room connection
  //id = the person sending the message. i.e, the user has its own room
  const id = socket.handshake.query.id;
  console.log("handshake id:", id);

  socket.join(id);

  socket.on("send-message", ({ recipients, text }) => {
    //send the message to each recipient using a forEach loop
    console.log("LIST recipients:", recipients);
    recipients.forEach((recipient) => {
      // clean out the recipient list: removing the current recipient from the list of recipients
      const newRecipients = recipients.filter((r) => r !== recipient);
      newRecipients.push(id); //adding the sender to the list or recipients

      socket.broadcast.to(recipient).emit("recieve-message", {
        recipients: newRecipients,
        sender: id,
        text,
      });
    });
  });

  socket.on("disconnect", () => {
    console.log(`Disonected user:`, id, socket.id);
  });
});

chatSever.listen(5000, () => {
  console.log("chatServer initialized on port 5000");
});
