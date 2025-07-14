import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  monthlyLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const createUser = async (
  userData: Omit<User, "createdAt" | "updatedAt">
) => {
  try {
    const userRef = doc(db, "users", userData.id);
    const now = new Date();
    await setDoc(userRef, {
      ...userData,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        id: userSnap.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as User;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as User;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};
