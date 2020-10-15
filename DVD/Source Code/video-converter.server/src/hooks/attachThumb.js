const fs = require("fs");

module.exports = async (context) => {
  function base64Encode(file) {
    const bitmap = fs.readFileSync(file);
    return Buffer.from(bitmap).toString("base64");
  }
  const result = await context.app.service("uploads").get(context.id);
  // eslint-disable-next-line
  if (context.params.user._id == result.userId) {
    context.result.data = base64Encode(
      `${result.newNameWithPath}_thumb\\tn_${context.params.query.thumbId}.png`
    );
  } else {
    throw new Error(
      "Requested thumb does not belong to a video uploaded by the current user."
    );
  }
  return context;
};
