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

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category: string;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

interface FirestoreGoal
  extends Omit<Goal, "deadline" | "completedAt" | "createdAt" | "updatedAt"> {
  deadline?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createGoal = async (
  goalData: Omit<Goal, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const goalsRef = collection(db, "goals");
    const now = Timestamp.fromDate(new Date());
    const firestoreData: Omit<FirestoreGoal, "id"> = {
      ...goalData,
      deadline: goalData.deadline
        ? Timestamp.fromDate(goalData.deadline)
        : undefined,
      completedAt: goalData.completedAt
        ? Timestamp.fromDate(goalData.completedAt)
        : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(goalsRef, firestoreData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getGoalById = async (goalId: string): Promise<Goal | null> => {
  try {
    const goalRef = doc(db, "goals", goalId);
    const goalSnap = await getDoc(goalRef);

    if (goalSnap.exists()) {
      const data = goalSnap.data() as FirestoreGoal;
      return {
        ...data,
        id: goalSnap.id,
        deadline: data.deadline?.toDate(),
        completedAt: data.completedAt?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const goalsRef = collection(db, "goals");
    const q = query(
      goalsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreGoal;
      return {
        ...data,
        id: doc.id,
        deadline: data.deadline?.toDate(),
        completedAt: data.completedAt?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateGoal = async (goalId: string, goalData: Partial<Goal>) => {
  try {
    const goalRef = doc(db, "goals", goalId);
    const { deadline, completedAt, createdAt, updatedAt, ...rest } = goalData;

    const updateData: Partial<FirestoreGoal> = {
      ...rest,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (deadline) {
      updateData.deadline = Timestamp.fromDate(deadline);
    }

    if (completedAt) {
      updateData.completedAt = Timestamp.fromDate(completedAt);
    }

    await updateDoc(goalRef, updateData);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
