// Convert The Video And Add Additional Attributes
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const logger = require("../logger");

module.exports = async (context) => {
  function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
  }

  // Converted File Name
  // eslint-disable-next-line
  const convertsPath = `public/uploads/${context.params.user._id}/converts`;
  const newFilePath = `${convertsPath}/${Date.now()}${context.data.upload.originalName.replace(
    / /g,
    ""
  )}_Converted.${context.data.format}`;
  if (!fs.existsSync(convertsPath)) {
    fs.mkdirSync(convertsPath);
  }

  // eslint-disable-next-line no-unused-vars
  const result = await new Promise((resolve, reject) => {
    const command = ffmpeg(context.data.upload.newNameWithPath)
      .on("progress", (progress) => {
        logger.info(`[ffmpeg] ${JSON.stringify(progress)}`);
      })
      .on("error", (err) => {
        logger.error(`[ffmpeg] error: ${err.message}`);
        reject(err);
      })
      .on("end", () => {
        logger.info("[ffmpeg] finished");
        resolve();
      });
    command.format(context.data.format);
    command.fps(context.data.frameRate);
    command.seek(context.data.range[0]);
    command.duration(context.data.range[1] - context.data.range[0]);
    if (context.data.type === "video") {
      command.size(`${context.data.height}x${context.data.width}`);
    }
    if (context.data.isAudioDisabled) {
      command.noAudio();
    }
    if (context.data.videoQuality < 100) {
      const { videoBitrate } = context.data.upload;
      const newBitrate = parseInt(
        (videoBitrate * context.data.videoQuality) / 100,
        10
      );
      command.videoBitrate(newBitrate);
      context.data.videoBitrate = newBitrate;
    } else {
      context.data.videoBitrate = context.data.upload.videoBitrate;
    }
    if (context.data.audioQuality < 100) {
      const { audioBitrate } = context.data.upload;
      const newBitrate = parseInt(
        (audioBitrate * context.data.audioQuality) / 100,
        10
      );
      command.audioBitrate(newBitrate);
      context.data.audioBitrate = newBitrate;
    } else {
      context.data.audioBitrate = context.data.upload.audioBitrate;
    }
    command.save(newFilePath);
  });

  // Add Attributes
  context.data.userId = context.data.upload.userId;
  // eslint-disable-next-line
  context.data.originalVideoId = context.data.upload._id;
  context.data.filePath = newFilePath;
  context.data.fileSize = await getFilesizeInBytes(newFilePath);
  context.data.name = `${context.data.name}.${context.data.format}`;
  [context.data.durationStart, context.data.durationEnd] = context.data.range;

  // Save Thumbnail
  const ssResult = await new Promise((resolve, reject) => {
    const imgDir = "public/uploads/images/";
    if (context.data.type === "video") {
      const resultThumb = ffmpeg(context.data.filePath)
        .takeScreenshots(
          {
            count: 1,
            size: "336x188",
          },
          imgDir,
          (err) => {
            logger.error(`[ffmepeg] error: ${err.message}`);
            reject();
          }
        )
        .on("end", () => {
          const bitmap = fs.readFileSync(`${imgDir}/tn.png`);
          context.data.thumbnail = Buffer.from(bitmap).toString("base64");
          const delConfirm = fs.unlinkSync(`${imgDir}/tn.png`);
          resolve();
		})
		.on("error", (err) => {
			console.log(err);
		});
    } else {
      const bitmap = fs.readFileSync(`${imgDir}/music.jpg`);
	  context.data.thumbnail = Buffer.from(bitmap).toString("base64");
	  resolve();
    }
  });
  return context;
};
