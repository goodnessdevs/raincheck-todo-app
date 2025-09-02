
// import * as admin from 'firebase-admin';

// const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
//   ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
//   : null;

// let firebaseAdminApp: admin.app.App;

// export function getFirebaseAdmin() {
//   if (!firebaseAdminApp) {
//     if (admin.apps.length > 0) {
//       firebaseAdminApp = admin.apps[0]!;
//     } else {
//         if (!serviceAccount) {
//             throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable not set.');
//         }
//         firebaseAdminApp = admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount),
//         });
//     }
//   }
//   return firebaseAdminApp;
// }


import * as admin from 'firebase-admin';

let firebaseAdminApp: admin.app.App;

export function getFirebaseAdmin() {
  if (!firebaseAdminApp) {
    if (admin.apps.length > 0) {
      firebaseAdminApp = admin.apps[0]!;
    } else {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable not set.');
      }
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        firebaseAdminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error: any) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", error.message);
        throw new Error("Could not initialize Firebase Admin SDK. Please check the FIREBASE_SERVICE_ACCOUNT_JSON environment variable.");
      }
    }
  }
  return firebaseAdminApp;
}
