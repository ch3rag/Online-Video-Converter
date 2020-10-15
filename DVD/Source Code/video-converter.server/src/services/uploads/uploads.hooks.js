const { authenticate } = require("@feathersjs/authentication").hooks;
const { setField } = require("feathers-authentication-hooks");
const { disallow } = require("feathers-hooks-common");

const processFile = require("../../hooks/processFile");

// Retrict Reading To Only Record Belonging To The Querying User
const readRestrict = [
  setField({
    from: "params.user._id",
    as: "params.query.userId",
  }),
];

/* eslint-disable */
function searchRegex(context) {
  const { query } = context.params;
  for (const field in query) {
    if (query[field].$search && field.indexOf("$") == -1) {
      query[field] = { $regex: new RegExp(query[field].$search) };
    }
  }
  context.params.query = query;
  return context;
}
/* eslint-enable */

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [...readRestrict, searchRegex],
    get: [...readRestrict],
    create: [processFile],
    update: [disallow("external")],
    patch: [disallow("external")],
    remove: [...readRestrict],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
