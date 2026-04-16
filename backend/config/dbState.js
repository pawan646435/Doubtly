// backend/config/dbState.js
let dbMode = 'disconnected';

const setDbMode = (mode) => {
  dbMode = mode;
};

const getDbMode = () => dbMode;

const isFirebaseMode = () => dbMode === 'firebase';

module.exports = {
  setDbMode,
  getDbMode,
  isFirebaseMode,
};
