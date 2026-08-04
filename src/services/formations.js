import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

const COLLECTION = 'formaciones';

export async function getFormation(id) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createFormation(players, authorName = '') {
  const ref = await addDoc(collection(db, COLLECTION), {
    createdAt: serverTimestamp(),
    authorName,
    players,
  });
  return ref.id;
}
