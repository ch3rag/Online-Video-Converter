// uploads-model.js - A mongoose model

// Changed Unnamed Function To Anonymous
module.exports = (app) => {
  const modelName = "uploads";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;

  const schema = new Schema(
    {
      description: { type: String, required: true },
      originalName: { type: String, required: true },
      newNameWithPath: { type: String, required: true },
      streamPath: { type: String, required: true },
      userId: { type: String, required: true },

      format: { type: String, required: true },
      audioBitrate: { type: Number, required: true },
      videoBitrate: { type: Number, required: true },
      resolution: { type: String, required: true },
      duration: { type: String, required: true },
      frameRate: { type: Number, required: true },
      fileSize: { type: Number, required: true },
      thumbnail: { type: String, require: true },
    },
    {
      timestamps: true,
    }
  );

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
