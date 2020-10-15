// Return Only Those Videos That Belong To The Requesting User

module.exports = (context) => {
  // eslint-disable-next-line
  context.result.data = context.result.data.filter(
    (video) => context.params.user._id == video.userId
  );
  return context;
};
