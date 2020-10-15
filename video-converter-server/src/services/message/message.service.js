// Initializes the `message` service on path `/message`
const Mailer = require("feathers-mailer");
const smtpTransport = require("nodemailer-smtp-transport");
const hooks = require("./message.hooks");

module.exports = (app) => {
  // Initialize our service with any options it requires
  app.use(
    "/message",
    new Mailer(
      smtpTransport({
        service: "Gmail",
        auth: {
          user: process.env.GMAIL,
          pass: process.env.GMAIL_PASSWORD,
        },
      })
    )
  );

  // Get our initialized service so that we can register hooks
  const service = app.service("message");

  service.hooks(hooks);
};
