import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebaseConfig";
import type { Intervention } from "../redux/features/newInterventionSlice";

const getDayReference = (userId: string, date: string) =>
  doc(db, "users", userId, "days", date);

const getInterventionsReference = (userId: string, date: string) =>
  collection(db, "users", userId, "days", date, "interventions");

const getSummaryReference = (userId: string, date: string) =>
  doc(db, "users", userId, "days", date, "summary", "daily");

const convertTimestampToString = (timestamp: any): string | null => {
  if (!timestamp) return null;
  return typeof timestamp.toDate === "function"
    ? timestamp.toDate().toISOString()
    : String(timestamp);
};

const mapIntervention = (
  documentId: string,
  dateKey: string,
  data: Record<string, any>,
): Intervention => {
  const { createdAt, updatedAt, ...interventionData } = data;

  return {
    ...interventionData,
    documentId,
    dateKey,
    createdAt: convertTimestampToString(createdAt),
    updatedAt: convertTimestampToString(updatedAt),
    isEditing: false,
  } as Intervention;
};

const updateSummaryInBackground = (userId: string, date: string) => {
  void recalculateDailySummary(userId, date).catch((error) => {
    console.error("Daily summary update failed:", error);
  });
};

export const createIntervention = async (
  userId: string,
  date: string,
  intervention: Intervention,
) => {
  const {
    documentId: _documentId,
    isEditing: _isEditing,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    dateKey: _dateKey,
    ...interventionData
  } = intervention;

  await setDoc(
    getDayReference(userId, date),
    { date, updatedAt: serverTimestamp() },
    { merge: true },
  );

  const documentReference = await addDoc(
    getInterventionsReference(userId, date),
    { ...interventionData, createdAt: serverTimestamp() },
  );

  updateSummaryInBackground(userId, date);
  return documentReference.id;
};

export const loadInterventions = async (
  userId: string,
  date: string,
): Promise<Intervention[]> => {
  const snapshot = await getDocs(getInterventionsReference(userId, date));
  return snapshot.docs.map((item) => mapIntervention(item.id, date, item.data()));
};

export interface HistoryDay {
  dateKey: string;
  interventions: Intervention[];
}

export const loadCompleteHistory = async (userId: string): Promise<HistoryDay[]> => {
  const daysSnapshot = await getDocs(collection(db, "users", userId, "days"));

  const days = await Promise.all(
    daysSnapshot.docs.map(async (dayDocument) => ({
      dateKey: dayDocument.id,
      interventions: await loadInterventions(userId, dayDocument.id),
    })),
  );

  return days
    .filter((day) => day.interventions.length > 0)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
};

export const deleteIntervention = async (
  userId: string,
  date: string,
  documentId: string,
) => {
  await deleteDoc(doc(getInterventionsReference(userId, date), documentId));
  await setDoc(
    getDayReference(userId, date),
    { date, updatedAt: serverTimestamp() },
    { merge: true },
  );
  updateSummaryInBackground(userId, date);
};

export const updateIntervention = async (
  userId: string,
  date: string,
  documentId: string,
  intervention: Intervention,
) => {
  const {
    documentId: _documentId,
    isEditing: _isEditing,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    dateKey: _dateKey,
    ...interventionData
  } = intervention;

  await updateDoc(doc(getInterventionsReference(userId, date), documentId), {
    ...interventionData,
    updatedAt: serverTimestamp(),
  });

  await setDoc(
    getDayReference(userId, date),
    { date, updatedAt: serverTimestamp() },
    { merge: true },
  );
  updateSummaryInBackground(userId, date);
};

export const recalculateDailySummary = async (userId: string, date: string) => {
  const snapshot = await getDocs(getInterventionsReference(userId, date));
  const summary = {
    total: 0,
    completed: 0,
    onHold: 0,
    transferred: 0,
    closedByAnotherAgent: 0,
    lastUpdated: null as null | ReturnType<typeof serverTimestamp>,
  };

  snapshot.docs.forEach((documentSnapshot) => {
    const intervention = documentSnapshot.data();
    summary.total += 1;
    switch (intervention.status) {
      case "completed": summary.completed += 1; break;
      case "on hold": summary.onHold += 1; break;
      case "transferred": summary.transferred += 1; break;
      case "closed by another agent": summary.closedByAnotherAgent += 1; break;
      default: break;
    }
  });

  await setDoc(
    getSummaryReference(userId, date),
    { ...summary, lastUpdated: serverTimestamp() },
    { merge: true },
  );
};

export const loadDailySummary = async (userId: string, date: string) => {
  const snapshot = await getDoc(getSummaryReference(userId, date));
  return snapshot.exists() ? snapshot.data() : null;
};
