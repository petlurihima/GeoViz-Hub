const webPush = require("web-push");
const Subscription = require("./models/Subscription");
const VAPID_KEYS = {
  publicKey: "BGNjS0xetibnVF4oSD_vn-A8ymQaKIhf53K4z0PivdP-1qB39tztlobW9eDlAJtihlcJcmkYBKkv-Zcc5fmMb08",
  privateKey: "gSiTTKRYsGOUcVepdgFDJw6Rp85LRgX57w43UCZNj7o",
};
webPush.setVapidDetails("mailto:your@email.com", VAPID_KEYS.publicKey, VAPID_KEYS.privateKey);
// Function to add a subscription to the database
const addSubscription = async (subscription) => {
  try {
    const existingSub = await Subscription.findOne({ endpoint: subscription.endpoint });

    if (!existingSub) {
      const newSub = new Subscription(subscription);
      await newSub.save();
      console.log("New subscription saved:", subscription);
    } else {
      console.log("Subscription already exists:", subscription);
    }
  } catch (error) {
    console.error("Error saving subscription:", error);
  }
};
// Function to remove an invalid subscription
const removeSubscription = async (subscriptionToRemove) => {
  try {
    await Subscription.deleteOne({ endpoint: subscriptionToRemove.endpoint });
    console.log("Removed invalid subscription:", subscriptionToRemove.endpoint);
  } catch (error) {
    console.error("Error removing subscription:", error);
  }
};
// Function to send a push notification
const sendNotification = async (message) => {
  try {
    const subscriptions = await Subscription.find();
    console.log(`Sending notifications to ${subscriptions.length} subscribers`);
    subscriptions.forEach(async (sub) => {
      try {
        await webPush.sendNotification(
          sub,
          JSON.stringify({ title: "New City Added!", body: message })
        );
        console.log("Notification sent successfully!");
      } catch (err) {
        console.error("Push Notification Error:", err);
        if (err.statusCode === 410) {
          console.log("Removing invalid subscription:", sub.endpoint);
          await removeSubscription(sub);
        }
      }
    });
  } catch (error) {
    console.error("Error retrieving subscriptions:", error);
  }
};
module.exports = { addSubscription, sendNotification, removeSubscription };