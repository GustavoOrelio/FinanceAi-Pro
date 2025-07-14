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

export interface Purchase {
  id: string;
  storeId: string;
  userId: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  date: Date;
  category: string;
  description: string;
  status: string;
  installments?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FirestorePurchase
  extends Omit<Purchase, "date" | "createdAt" | "updatedAt"> {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createPurchase = async (
  purchaseData: Omit<Purchase, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const purchasesRef = collection(db, "purchases");
    const now = Timestamp.fromDate(new Date());
    const docRef = await addDoc(purchasesRef, {
      ...purchaseData,
      date: Timestamp.fromDate(purchaseData.date),
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getPurchaseById = async (
  purchaseId: string
): Promise<Purchase | null> => {
  try {
    const purchaseRef = doc(db, "purchases", purchaseId);
    const purchaseSnap = await getDoc(purchaseRef);

    if (purchaseSnap.exists()) {
      const data = purchaseSnap.data() as FirestorePurchase;
      return {
        ...data,
        id: purchaseSnap.id,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserPurchases = async (userId: string): Promise<Purchase[]> => {
  try {
    const purchasesRef = collection(db, "purchases");
    const q = query(
      purchasesRef,
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as FirestorePurchase;
      return {
        ...data,
        id: doc.id,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updatePurchase = async (
  purchaseId: string,
  purchaseData: Partial<Purchase>
) => {
  try {
    const purchaseRef = doc(db, "purchases", purchaseId);
    const { date, createdAt, updatedAt, ...rest } = purchaseData;

    const updateData: Partial<FirestorePurchase> = {
      ...rest,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (date) {
      updateData.date = Timestamp.fromDate(date);
    }

    await updateDoc(purchaseRef, updateData);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
