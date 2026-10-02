// notificationUtils.js

// Ask permission from the user
export const requestNotificationPermission = async () => {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted");
    } else {
      console.log("Notification permission denied");
    }
  } else {
    console.log("This browser does not support notifications");
  }
};

// Show notification
export const showNotification = (title, message) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "/medicine-icon.png"
    });
  }
};