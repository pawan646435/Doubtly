let dbMode = 'disconnected';

const setDbMode = (mode) => {
  dbMode = mode;
};

const getDbMode = () => dbMode;

const isMongoMode = () => dbMode === 'mongo';

const isFileMode = () => dbMode === 'file';

module.exports = {
  setDbMode,
  getDbMode,
  isMongoMode,
  isFileMode,
};
