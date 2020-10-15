const accountService = require("../services/authmanagement/notifier");

module.exports = (context) => {
  if (!context.params.provider) {
    return context;
  }
  const user = context.result;
  if (process.env.GMAIL && context.data && context.data.email && user) {
    accountService(context.app).notifier("resendVerifySignup", user);
    return context;
  }
  return context;
};
