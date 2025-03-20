import { useState, useEffect } from "react";
import { askNotificationPermission } from "./NotificationService";

const Notifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log("User is already subscribed:", subscription);
      // If site data is cleared, forcing to unsubscribe
      const permission = Notification.permission;
      if (permission === "default") {
        console.log("User cleared site data. Unsubscribing...");
        await subscription.unsubscribe();
        setIsSubscribed(false);
        setShowPopup(true); 
     } 
     else {
      setIsSubscribed(true); 
    }
    }else {
      setShowPopup(true); 
    }
  }
  const unsubscribeUser = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const unsubscribed = await subscription.unsubscribe();
      if (unsubscribed) {
        console.log("User unsubscribed from push notifications");

        // Send request to backend to remove subscription
        await fetch("http://localhost:5000/api/unsubscribe", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: { "Content-Type": "application/json" },
        });
        setIsSubscribed(false);
        setShowPopup(true);
      }
    }
  };

  return (
    <>
      {showPopup && !isSubscribed &&(
        <div style={popupStyles}>
          <div style={popupContentStyles}>
            <p>Do you want to enable notifications?</p>
            <button onClick={()=>askNotificationPermission(setIsSubscribed)}>Yes</button>
            <button onClick={() => setShowPopup(false)}>No</button>
          </div>
        </div>
      )}
      {isSubscribed ? (
        <div style={buttonContainerStyles}>
          <button
            onClick={() =>
              navigator.serviceWorker.ready.then((reg) =>
                reg.showNotification("Test Notification", {
                  body: "This is a test push notification!",
                })
              )
            }
            style={testButtonStyles}
          >
            Send Test Notification
          </button>
          <button onClick={unsubscribeUser} style={unsubscribeButtonStyles}>
            Unsubscribe
          </button>
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>You are not subscribed to notifications.</p>
      )}
    </>
  );
};

const popupStyles: React.CSSProperties = {
    position: "fixed",  
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, 
  };
  
  const popupContentStyles: React.CSSProperties = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    color: "black",
    position: "relative",
  };
  const buttonContainerStyles: React.CSSProperties = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    display: "flex",
    flexDirection: "column", 
    gap: "10px", 
    zIndex: 1000,
  };
  const testButtonStyles: React.CSSProperties = {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const unsubscribeButtonStyles: React.CSSProperties = {
    padding: "10px 20px",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };
export default Notifications;