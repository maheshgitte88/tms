import io from "socket.io-client";

const socket = io.connect("http://localhost:2000");

export default socket;
