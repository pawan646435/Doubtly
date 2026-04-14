const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Doubt = require('../models/Doubt');
const { isMongoMode } = require('../config/dbState');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'doubts.json');

const ensureStoreFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf8');
  }
};

const readStore = () => {
  ensureStoreFile();

  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`⚠ Local doubt store was unreadable. Resetting it. (${error.message})`);
    fs.writeFileSync(dataFile, '[]', 'utf8');
    return [];
  }
};

const writeStore = (records) => {
  ensureStoreFile();
  fs.writeFileSync(dataFile, JSON.stringify(records, null, 2), 'utf8');
};

const toPlainObject = (doc) => {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
};

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
  if (isMongoMode()) {
    const doubt = new Doubt(payload);
    await doubt.save();
    return toPlainObject(doubt);
  }

  const now = new Date().toISOString();
  const record = {
    _id: new mongoose.Types.ObjectId().toString(),
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

  const records = readStore();
  records.unshift(record);
  writeStore(records);
  return { ...record };
};

const listDoubts = async ({ filter = {}, skip = 0, limit = 20, select = null } = {}) => {
  if (isMongoMode()) {
    const doubts = await Doubt.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(select || '');

    return doubts.map(toPlainObject);
  }

  return readStore()
    .filter((record) => matchesFilter(record, filter))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(skip, skip + limit)
    .map((record) => applySelect(record, select));
};

const countDoubts = async (filter = {}) => {
  if (isMongoMode()) {
    return Doubt.countDocuments(filter);
  }

  return readStore().filter((record) => matchesFilter(record, filter)).length;
};

const getDoubtById = async (id) => {
  if (isMongoMode()) {
    return toPlainObject(await Doubt.findById(id));
  }

  return readStore().find((record) => record._id === id) || null;
};

const updateDoubtById = async (id, updates) => {
  if (isMongoMode()) {
    const updated = await Doubt.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return toPlainObject(updated);
  }

  const records = readStore();
  const index = records.findIndex((record) => record._id === id);
  if (index === -1) return null;

  records[index] = {
    ...records[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeStore(records);
  return { ...records[index] };
};

const deleteDoubtById = async (id) => {
  if (isMongoMode()) {
    return toPlainObject(await Doubt.findByIdAndDelete(id));
  }

  const records = readStore();
  const index = records.findIndex((record) => record._id === id);
  if (index === -1) return null;

  const [removed] = records.splice(index, 1);
  writeStore(records);
  return removed;
};

module.exports = {
  createDoubt,
  listDoubts,
  countDoubts,
  getDoubtById,
  updateDoubtById,
  deleteDoubtById,
};
