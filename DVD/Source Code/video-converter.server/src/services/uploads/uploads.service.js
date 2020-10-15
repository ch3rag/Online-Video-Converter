const multer = require("multer");
const fs = require("fs");
const { authenticate } = require("@feathersjs/express");
const logger = require("../../logger");
const { Uploads } = require("./uploads.class");
const createModel = require("../../models/uploads.model");
const hooks = require("./uploads.hooks");

const storage = multer.diskStorage({
  // eslint-disable-next-line
  destination: (req, file, cb) => {
    // eslint-disable-next-line
    const path = `public/uploads/${req.user._id}`;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    return cb(null, path);
  },
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/ /g, "")}`),
});

const upload = multer({
  storage,
  limits: {
    fieldSize: 5e8,
    fileSize: 5e8,
  },
});

// Changed Unnamed Funtion To Anonymous
module.exports = (app) => {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
    multi: true,
  };

  app.use(
    "/uploads",
    authenticate("jwt"),
    upload.array("files"),
    (req, res, next) => {
      const { method } = req;
      if (method === "POST" || method === "PATCH") {
        req.feathers.files = req.files;
        const body = [];
        const files = Object.values(req.files);
        files.forEach((file) => {
          body.push({
            description: req.body.description,
            originalName: req.body.originalname,
            newNameWithPath: file.path,
          });
          req.body = method === "POST" ? body : body[0];
        });
        next();
      } else if (method === "DELETE") {
        app
          .service("uploads")
          // eslint-disable-next-line
          .get(req.params.__feathersId)
          .then((result) => {
            if (result.format !== "mp4") {
              fs.unlinkSync(result.streamPath);
            }
            fs.unlinkSync(result.newNameWithPath);
            fs.rmdirSync(`${result.newNameWithPath}_thumb`, {
              recursive: true,
            });
            next();
          })
          .catch((err) => {
            logger.error(err.message);
          });
      } else {
        next();
      }
    },
    (req, res, next) => {
      const { method } = req;
      if (method === "POST" || method === "PATCH") {
        req.body[0].originalName = req.files[0].originalname;
        req.body[0].newNameWithPath = req.files[0].path;
      }
      next();
    },
    new Uploads(options, app)
  );
  const service = app.service("uploads");
  service.hooks(hooks);
};
