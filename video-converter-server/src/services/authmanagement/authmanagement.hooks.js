// const hooks = require('feathers-hooks');
const auth = require("@feathersjs/authentication").hooks;
const { iff } = require("feathers-hooks-common");

const isAction = (...args) => (hook) => args.includes(hook.data.action);

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(isAction("passwordChange, identityChange"), auth.authenticate("jwt")),
    ],
    update: [],
    patch: [],
    remove: [],
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
