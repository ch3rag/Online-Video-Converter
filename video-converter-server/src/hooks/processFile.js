// Add Additional Video Info To Uploaded Video
const fs = require("fs");
const util = require("util");
const ffmpeg = require("fluent-ffmpeg");
// Promisify exec()
const exec = util.promisify(require("child_process").exec);
const logger = require("../logger");

module.exports = async (context) => {
  function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
  }

  // Unfortunately exec() Output Is Piped To Standard Error
  const { stderr } = await exec(`ffprobe ${context.data[0].newNameWithPath}`);
  // Apply Regex ffprobe Output To Retrieve Additional Information
  const durationRegex = /Duration: (.*?),/;
  const videoBitrateRegex = /Stream.+Video.+, (.*?)kb\/s/;
  const audioBitrateRegex = /Stream.+Audio.+, (.*?)kb\/s/;
  const formatRegex = /Input.*?\.(.*)':/;
  const resolutionRegex = /Stream #\d:\d.*, (\d+x\d+)/;
  const fpsRegex = /Stream #\d:\d.*, (\d+\.?\d+? fps)/;

  // Add Attributes
  const duration = durationRegex.exec(stderr);
  const videoBitrate = videoBitrateRegex.exec(stderr);
  const audioBitrate = audioBitrateRegex.exec(stderr);
  const format = formatRegex.exec(stderr);
  const resolution = resolutionRegex.exec(stderr);
  const frameRate = fpsRegex.exec(stderr);

  context.data[0].format = format ? format[1] : "Unidentified";
  context.data[0].videoBitrate = videoBitrate
    ? parseInt(videoBitrate[1], 10)
    : 0;
  context.data[0].audioBitrate = audioBitrate
    ? parseInt(audioBitrate[1], 10)
	: 0;
	
  let durationStream;

  if (context.data[0].format !== "mp4") {
    await new Promise((resolve, reject) => {
      const command = ffmpeg(context.data[0].newNameWithPath)
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
      command.format("mp4");
      const streamPath = `${context.data[0].newNameWithPath}_.mp4`;
      command.save(streamPath);
      context.data[0].streamPath = streamPath;
    });
    // eslint-disable-next-line
    const { stderr } = await exec(`ffprobe ${context.data[0].streamPath}`);
	const frameRateStream = fpsRegex.exec(stderr);
	durationStream = durationRegex.exec(stderr);
    context.data[0].frameRate = frameRateStream
      ? parseInt(frameRateStream[1], 10)
	  : 0;
	
    if (context.data[0].videoBitrate === 0) {
      // eslint-disable-next-line
      const videoBitrate = videoBitrateRegex.exec(stderr);
      context.data[0].videoBitrate = videoBitrate
        ? parseInt(videoBitrate[1], 10)
        : 0;
    }
    if (context.data[0].audioBitrate === 0) {
      // eslint-disable-next-line
      const audioBitrate = audioBitrateRegex.exec(stderr);
      context.data[0].audioBitrate = audioBitrate
        ? parseInt(audioBitrate[1], 10)
        : 0;
    }
  } else {
    context.data[0].streamPath = context.data[0].newNameWithPath;
    context.data[0].frameRate = frameRate ? parseInt(frameRate[1], 10) : 0;
  }

  // eslint-disable-next-line
  context.data[0].userId = context.params.user._id;
  context.data[0].duration = duration && duration[1] !== 'N/A' ? duration[1] : durationStream[1];
  context.data[0].resolution = resolution ? resolution[1] : "Unidentified";
  context.data[0].fileSize = getFilesizeInBytes(
    context.data[0].newNameWithPath
  );
  const ssDir = `${context.data[0].newNameWithPath}_thumb`;
  fs.mkdirSync(ssDir);
  // changed newNameWithPath to streamPath
  await ffmpeg(context.data[0].streamPath).takeScreenshots(
    {
      count: 30,
      size: "336x188",
    },
    ssDir,
    (err) => {
      logger.error(`[ffmepeg] error: ${err.message}`);
    }
  );
  // Save Thumbnail
  const ssResult = await new Promise((resolve, reject) => {
	const imgDir = "public/uploads/images/";
	// changed newNameWithPath to streamPath
    ffmpeg(context.data[0].streamPath).takeScreenshots(
      {
        count: 1,
        size: "336x188",
      },
      imgDir,
      (err) => {
		logger.error(`[ffmepeg] error: ${err.message}`);
		reject();
      }
    ).on('end', () => {
		const bitmap = fs.readFileSync(`${imgDir}/tn.png`);
  		context.data[0].thumbnail = Buffer.from(bitmap).toString("base64");
  		// eslint-disable-next-line
  		const removeResult = fs.unlinkSync(`${imgDir}/tn.png`);
		resolve();
	}) 
  });

  
  return context;
};
