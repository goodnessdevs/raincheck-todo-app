
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : null;

let firebaseAdminApp: admin.app.App;

export function getFirebaseAdmin() {
  if (!firebaseAdminApp) {
    if (admin.apps.length > 0) {
      firebaseAdminApp = admin.apps[0]!;
    } else {
        if (!serviceAccount) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable not set.');
        }
        firebaseAdminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
  }
  return firebaseAdminApp;
}
