// import React, { useState } from "react";

// async function notifyUser(notificationText = "Thank you for enabling notifications") {
//   if (!("Notification" in window)) {
//     alert("Your browser does not support notifications");
//   } else if (Notification.permission === "granted") {
//     const notification = new Notification(notificationText);
//   } else if (Notification.permission !== "denied") {
//     const permission = await Notification.requestPermission();
//     if (permission === "granted") {
//       const notification = new Notification(notificationText);
//     }
//   }
// }

// function Nitifications() {
//   const [userResponse, setUserResponse] = useState(false);

//   async function enabledNotifications() {
//     await notifyUser();
//     setUserResponse(true);
//   }

//   function disabledNotifications() {
//     setUserResponse(true);
//   }

//   return !userResponse && Notification.permission !== "granted" ? (
//     <div className="p-5 bg-red-600" role="alert">
//       <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
//         <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
//           <div>Would you like to enable notifications?</div>
//           <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={enabledNotifications}>Sure!</button>
//           <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={disabledNotifications}>No Thanks!</button>
//         </div>
//       </div>
//     </div>
//   ) : Notification.permission === "granted" ? (
//     <div>
//       <button className="bg-teal-600" onClick={() => notifyUser("Thank you for using TMS")}>Click to Notify</button>
//     </div>
//   ) : (
//     <>
//       <h1>You have disabled notifications</h1>
//     </>
//   );
// }

// export default Nitifications;
