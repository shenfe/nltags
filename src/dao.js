let PouchDB = require('pouchdb');
if (typeof PouchDB.default === 'function') {
    PouchDB = PouchDB.default;
}
PouchDB.plugin(require('pouchdb-find'));

let db;

const open = (dbPath, options = {}) => {
    db = new PouchDB(`${dbPath}/term`, options);

    options.index && db.createIndex({
        index: options.index
    });
};

const find = queryObj => {
    return db.find({
        selector: {
            ...queryObj
        }
    });
};

const put = docObj => {
    return db.put(docObj);
};

const post = docObj => {
    return db.post(docObj);
};

module.exports = {
    open,
    find,
    put,
    post
};
