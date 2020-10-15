// users-model.js - A mongoose model

// Changed Unnamed Function To Anonymous
module.exports = (app) => {
  const modelName = "users";
  const mongooseClient = app.get("mongooseClient");

  const schema = new mongooseClient.Schema(
    {
      displayName: { type: String, required: true },
      email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
      },
      password: { type: String, required: true },
      dob: { type: Date, required: true },
      avatar: { type: String, required: true },

      isVerified: { type: Boolean },
      verifyToken: { type: String },
      verifyShortToken: { type: String },
      verifyExpires: { type: Date },
      verifyChanges: { type: Object },
      resetToken: { type: String },
      resetShortToken: { type: String },
      resetExpires: { type: Date },
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
