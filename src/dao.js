let PouchDB = require('pouchdb');
if (typeof PouchDB.default === 'function') {
    PouchDB = PouchDB.default;
}
PouchDB.plugin(require('pouchdb-find'));

const DB = {
    pos: null,
    dp: null,
    sdp: null
};

const open = (dbPath, options = {}) => {
    const dbName = options.type || 'pos';
    if (!DB.hasOwnProperty(dbName)) return;
    DB[dbName] = new PouchDB(`${dbPath}/${dbName}`, options);

    options.index && DB[dbName].createIndex({
        index: options.index
    });
};

const handleArgs = obj => {
    const dbName = obj.type || 'pos';
    if (!DB.hasOwnProperty(dbName)) return {};
    const db = DB[dbName];
    const obj1 = { ...obj };
    delete obj1.type;
    return { db, obj: obj1 };
};

const find = queryObj => {
    const { db, obj } = handleArgs(queryObj);
    return db.find({ selector: obj });
};

const get = ({ type, _id }) => {
    const dbName = type || 'pos';
    if (!DB.hasOwnProperty(dbName)) return;
    return DB[dbName].get(_id);
};

const put = docObj => {
    const { db, obj } = handleArgs(docObj);
    return db.put(obj);
};

const post = docObj => {
    const { db, obj } = handleArgs(docObj);
    return db.post(obj);
};

module.exports = {
    open,
    find,
    get,
    put,
    post
};
