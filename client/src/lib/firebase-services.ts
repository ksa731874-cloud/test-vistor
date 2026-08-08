/**
 * Firebase Services - Firebase Version
 */
import { db } from './firebase';
import { 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc, 
  addDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import type { InsuranceApplication, ChatMessage } from './firestore-types';

export const createApplication = async (
  data: Omit<InsuranceApplication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const id = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const docRef = doc(db, 'pays', id);
  await setDoc(docRef, {
    ...data,
    id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return id;
};

export const updateApplication = async (id: string, data: Partial<InsuranceApplication>): Promise<void> => {
  const docRef = doc(db, 'pays', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const getApplication = async (id: string): Promise<InsuranceApplication | null> => {
  const docRef = doc(db, 'pays', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as InsuranceApplication;
  }
  return null;
};

export const sendMessage = async (
  data: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'messages'), {
    ...data,
    timestamp: serverTimestamp(),
    read: false
  });
  return docRef.id;
};

export const getMessages = async (applicationId: string): Promise<ChatMessage[]> => {
  const q = query(
    collection(db, 'messages'), 
    where('applicationId', '==', applicationId), 
    orderBy('timestamp', 'asc')
  );
  const querySnapshot = await import('firebase/firestore').then(m => m.getDocs(q));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ChatMessage);
};

export const subscribeToMessages = (
  applicationId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'messages'), 
    where('applicationId', '==', applicationId), 
    orderBy('timestamp', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as ChatMessage
    );
    callback(messages);
  });
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  const docRef = doc(db, 'messages', messageId);
  await updateDoc(docRef, { read: true });
};

export const subscribeToApplications = (
  callback: (applications: InsuranceApplication[]) => void
): (() => void) => {
  const q = query(collection(db, 'pays'));
  return onSnapshot(q, (snapshot) => {
    const applications = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as InsuranceApplication
    );
    callback(applications);
  });
};
