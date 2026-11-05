const COLLECTION = 'formaciones';

// The lite SDK (REST, no realtime/offline cache) covers everything the app needs
// at a fraction of the size, and loading it lazily keeps it out of the first paint.
let firestorePromise = null;

function loadFirestore() {
  firestorePromise ??= Promise.all([import('firebase/firestore/lite'), import('../firebase.js')])
    .then(([sdk, { app }]) => ({ sdk, db: sdk.getFirestore(app) }))
    .catch((err) => {
      firestorePromise = null; // allow a retry after a network failure
      throw err;
    });
  return firestorePromise;
}

export function preloadFirestore() {
  loadFirestore().catch(() => {});
}

export async function getFormation(id) {
  const { sdk, db } = await loadFirestore();
  const snap = await sdk.getDoc(sdk.doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createFormation(players, authorName, mode) {
  const { sdk, db } = await loadFirestore();
  const ref = await sdk.addDoc(sdk.collection(db, COLLECTION), {
    createdAt: sdk.serverTimestamp(),
    authorName,
    mode,
    players,
  });
  return ref.id;
}
