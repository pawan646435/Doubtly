// backend/repositories/doubtRepository.js
const admin = require('firebase-admin');

const COLLECTION = 'doubts';

const doubtsCollection = () => {
  if (!admin.apps.length) {
    throw new Error('Firestore is not initialized. Check Firebase credentials.');
  }
  return admin.firestore().collection(COLLECTION);
};

const toIsoString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return null;
};

const normalizeRecord = (id, data = {}) => ({
  _id: id,
  id,
  ...data,
  createdAt: toIsoString(data.createdAt) || new Date().toISOString(),
  updatedAt: toIsoString(data.updatedAt) || new Date().toISOString(),
});

const matchesFilter = (record, filter = {}) =>
  Object.entries(filter).every(([key, value]) => record[key] === value);

const applySelect = (record, selectFields) => {
  if (!selectFields) return { ...record };

  const keys = selectFields
    .split(' ')
    .map((field) => field.trim())
    .filter(Boolean);

  const selected = keys.reduce((result, key) => {
    if (key in record) {
      result[key] = record[key];
    }
    return result;
  }, {});

  if ('_id' in record) {
    selected._id = record._id;
    selected.id = record._id;
  }

  return selected;
};

const createDoubt = async (payload) => {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const ref = doubtsCollection().doc();

  const record = {
    followUps: [],
    practiceQuestions: [],
    keyConcepts: [],
    finalAnswer: '',
    imagePath: null,
    ocrText: null,
    ...payload,
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(record);
  const saved = await ref.get();
  return normalizeRecord(saved.id, saved.data());
};

const listDoubts = async ({ filter = {}, skip = 0, limit = 20, select = null } = {}) => {
  let query = doubtsCollection();

  if (filter.category) {
    query = query.where('category', '==', filter.category);
  }

  const snapshot = await query.get();

  return snapshot.docs
    .map((doc) => normalizeRecord(doc.id, doc.data()))
    .filter((record) => matchesFilter(record, filter))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(skip, skip + limit)
    .map((record) => applySelect(record, select));
};

const countDoubts = async (filter = {}) => {
  let query = doubtsCollection();

  if (filter.category) {
    query = query.where('category', '==', filter.category);
  }

  const snapshot = await query.get();
  return snapshot.size;
};

const getDoubtById = async (id) => {
  const doc = await doubtsCollection().doc(id).get();
  if (!doc.exists) return null;

  return normalizeRecord(doc.id, doc.data());
};

const updateDoubtById = async (id, updates) => {
  const ref = doubtsCollection().doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  await ref.set(
    {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const updated = await ref.get();
  return normalizeRecord(updated.id, updated.data());
};

const deleteDoubtById = async (id) => {
  const ref = doubtsCollection().doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const record = normalizeRecord(existing.id, existing.data());
  await ref.delete();
  return record;
};

module.exports = {
  createDoubt,
  listDoubts,
  countDoubts,
  getDoubtById,
  updateDoubtById,
  deleteDoubtById,
};
