const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

let db;

const open = (dbPath) => {
    db = new PouchDB(`${dbPath}/term`);
    db.createIndex({
        index: {
            fields: ['name']
        }
    });
};

const find = queryObj => {
    return db.find({
        selector: {
            ...queryObj
        }
    });
};

const post = docObj => {
    return db.post(docObj);
};

module.exports = {
    open,
    find,
    post
};
