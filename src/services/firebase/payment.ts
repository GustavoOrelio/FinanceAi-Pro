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

export interface Payment {
  id: string;
  purchaseId: string;
  amount: number;
  method: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface FirestorePayment
  extends Omit<Payment, "date" | "createdAt" | "updatedAt"> {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createPayment = async (
  paymentData: Omit<Payment, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const paymentsRef = collection(db, "payments");
    const now = Timestamp.fromDate(new Date());
    const firestoreData: Omit<FirestorePayment, "id"> = {
      ...paymentData,
      date: Timestamp.fromDate(paymentData.date),
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(paymentsRef, firestoreData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getPaymentById = async (
  paymentId: string
): Promise<Payment | null> => {
  try {
    const paymentRef = doc(db, "payments", paymentId);
    const paymentSnap = await getDoc(paymentRef);

    if (paymentSnap.exists()) {
      const data = paymentSnap.data() as FirestorePayment;
      return {
        ...data,
        id: paymentSnap.id,
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

export const getPurchasePayments = async (
  purchaseId: string
): Promise<Payment[]> => {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(
      paymentsRef,
      where("purchaseId", "==", purchaseId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as FirestorePayment;
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

export const updatePayment = async (
  paymentId: string,
  paymentData: Partial<Payment>
) => {
  try {
    const paymentRef = doc(db, "payments", paymentId);
    const { date, createdAt, updatedAt, ...rest } = paymentData;

    const updateData: Partial<FirestorePayment> = {
      ...rest,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (date) {
      updateData.date = Timestamp.fromDate(date);
    }

    await updateDoc(paymentRef, updateData);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
