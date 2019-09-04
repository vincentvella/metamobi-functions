import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
admin.initializeApp(functions.config().firebase);

exports.processSignUp = functions.auth.user().onCreate(async user => {
  console.log(user);
  const customClaims = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "user",
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": user.uid
    }
  };
  // Set custom user claims on this newly created user.
  try {
    await admin.auth().setCustomUserClaims(user.uid, customClaims);
    console.log("Custom claims added: ", customClaims);
    // Update real-time database to notify client to force refresh.
    const metadataRef = admin.database().ref("metadata/" + user.uid);
    // Set the refresh time to the current UTC timestamp.
    // This will be captured on the client to force a token refresh.
    return metadataRef.set({ refreshTime: new Date().getTime() });
  } catch (error) {
    console.log(error);
  }
});
