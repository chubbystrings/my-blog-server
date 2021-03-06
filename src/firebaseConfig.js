/* eslint-disable quote-props */
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = {
  'type': process.env.SERVICE_TYPE,
  'project_id': process.env.SERVICE_PROJECT_ID,
  'private_key_id': process.env.SERVICE_PRIVATE_KEY_ID,
  'private_key': process.env.SERVICE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  'client_email': process.env.SERVICE_CLIENT_EMAIL,
  'client_id': process.env.SERVICE_CLIENT_ID,
  'auth_uri': process.env.SERVICE_AUTH_URI,
  'token_uri': process.env.SERVICE_TOKEN_URI,
  'auth_provider_x509_cert_url': process.env.SERVICE_AUTH_PROVIDER_CERT,
  'client_x509_cert_url': process.env.SERVICE_CLIENT_CERT,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL,
});
const db = admin.firestore();

module.exports = {
  admin,
  db,
};
