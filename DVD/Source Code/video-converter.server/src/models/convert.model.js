// convert-model.js - A mongoose model

// Changed Unnamed Funtion To Anonymous
module.exports = (app) => {
  const modelName = "convert";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;

  const schema = new Schema(
    {
      name: { type: String, require: true },
      format: { type: String, required: true },
      height: { type: Number, required: true },
      width: { type: Number, required: true },
      filePath: { type: String, required: true },
      originalVideoId: { type: String, required: true },
      userId: { type: String, required: true },
      type: { type: String, required: true },
      isAudioDisabled: { type: String, required: true },
      frameRate: { type: Number, required: true },
      durationStart: { type: Number, required: true },
      durationEnd: { type: Number, required: true },
      fileSize: { type: Number, required: true },
      thumbnail: { type: String, required: true },
      audioBitrate: { type: Number, required: true },
      videoBitrate: { type: Number, required: true },
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
