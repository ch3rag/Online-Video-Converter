// Initializes the `convert` service on path `/convert`

const fs = require("fs");
const MimeLookup = require("mime-lookup");
const mimeDb = require("mime-db");
const logger = require("../../logger");

const mime = new MimeLookup(mimeDb);
const { Convert } = require("./convert.class");
const createModel = require("../../models/convert.model");
const hooks = require("./convert.hooks");

// Changed Unnamed Funtion To Anonymous
module.exports = (app) => {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use(
    "/convert",
    async (req, res, next) => {
      const { method } = req;
      if (method === "GET" && req.query.download) {
        // Fetch The Converted Video Using Query URL
        app
          .service("convert")
          .find({
            query: {
              // eslint-disable-next-line
              _id: req.params.__feathersId,
            },
          })
          .then((result) => {
            // Send The Converted Video To The Client
            // TODO: If Not Found Send Error
            const newFilePath = result.data[0].filePath;
            const file = fs.createReadStream(newFilePath);
            const stat = fs.statSync(newFilePath);
            res.status(200);
            res.setHeader("Content-Length", stat.size);
            res.setHeader("Content-Type", mime.lookup(newFilePath));
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${newFilePath}`
            );
            file.pipe(res);
          })
          .catch((err) => {
			  console.log(err);
            next();
          });
      } else if (method === "DELETE") {
        // eslint-disable-next-line
        await app
          .service("convert")
          .get(req.params.__feathersId)
          .then((result) => {
            fs.unlinkSync(result.filePath);
          })
          .catch((err) => {
            logger.error(err.message);
          });
        next();
      } else {
        next();
      }
    },
    new Convert(options, app)
  );

  // Get our initialized service so that we can register hooks
  const service = app.service("convert");

  service.hooks(hooks);
};
