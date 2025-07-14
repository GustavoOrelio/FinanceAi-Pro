import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Store {
  id: string;
  name: string;
  description?: string;
  category: string;
  logo?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FirestoreStore extends Omit<Store, "createdAt" | "updatedAt"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createStore = async (
  storeData: Omit<Store, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const storesRef = collection(db, "stores");
    const now = Timestamp.fromDate(new Date());
    const docRef = await addDoc(storesRef, {
      ...storeData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getStoreById = async (storeId: string): Promise<Store | null> => {
  try {
    const storeRef = doc(db, "stores", storeId);
    const storeSnap = await getDoc(storeRef);

    if (storeSnap.exists()) {
      const data = storeSnap.data() as FirestoreStore;
      return {
        ...data,
        id: storeSnap.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserStores = async (userId: string): Promise<Store[]> => {
  try {
    const storesRef = collection(db, "stores");
    const q = query(
      storesRef,
      where("createdById", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreStore;
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateStore = async (
  storeId: string,
  storeData: Partial<Store>
) => {
  try {
    const storeRef = doc(db, "stores", storeId);
    const { createdAt, updatedAt, ...rest } = storeData;

    const updateData: Partial<FirestoreStore> = {
      ...rest,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    await updateDoc(storeRef, updateData);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
