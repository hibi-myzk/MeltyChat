import 'firebase/firestore';

import firebase from './firebase';

const dbSettings = {};

export const db = firebase.firestore();
db.settings(dbSettings);
