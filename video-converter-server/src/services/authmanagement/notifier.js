const logger = require("../../logger");

// Changed Unnamed Funtion To Anonymous
module.exports = (app) => {
  function getLink(type, hash) {
    return `${process.env.FRONTEND_ADDR}/${type}?token=${hash}`;
  }

  function sendMail(email) {
    return app
      .service("message")
      .create(email)
      .then((result) => {
        logger.info(result);
      })
      .catch((err) => {
        logger.error(err);
      });
  }

  return {
    notifier: (type, user) => {
      let tokenLink;
      let email;
      switch (type) {
        // Email Verification On SignUp
        case "resendVerifySignup":
          tokenLink = getLink("verify", user.verifyToken);
          email = {
            from: process.env.GMAIL,
            to: user.email,
            subject: "Please Verify Your Email!",
            html: tokenLink,
          };
          return sendMail(email);

        // Email Thanking For Verifcation
        case "verifySignup":
          email = {
            from: process.env.GMAIL,
            to: user.email,
            subject: "Confirm Signup",
            html:
              "Thank You For Verifying Your Email! Have Fun Using Online Video Converter!",
          };
          return sendMail(email);

        case "sendResetPwd":
          tokenLink = getLink("reset", user.resetToken);
          email = {
            from: process.env.GMAIL,
            to: user.email,
            subject: "Reset Your Online Video Converter Password!",
            html: tokenLink,
          };
          return sendMail(email);
        default:
          break;
      }
      return null;
    },
  };
};
