// backend/config/db.js
// Firebase Admin / Firestore initialization

const admin = require('firebase-admin');
const { setDbMode } = require('./dbState');

let connectionPromise = null;

const parseServiceAccountFromEnv = () => {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    return JSON.parse(rawJson);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    };
  }

  return null;
};

const initFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = parseServiceAccountFromEnv();

  if (serviceAccount) {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
    });
  }

  // Supports GOOGLE_APPLICATION_CREDENTIALS / platform-provided credentials.
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
};

const connectDB = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      initFirebaseAdmin();
      const firestore = admin.firestore();

      // Lightweight connectivity validation.
      await firestore.collection('_health').limit(1).get();

      setDbMode('firebase');
      console.log(`✦ Firestore connected: ${admin.app().options.projectId || 'default-project'}`);
      return 'firebase';
    } catch (error) {
      connectionPromise = null;
      setDbMode('disconnected');
      throw new Error(`Firestore init error: ${error.message}`);
    }
  })();

  return connectionPromise;
};

module.exports = connectDB;
