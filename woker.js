const {
  Worker,
  isMainThread,
  parentPort,
  workerData
} = require("worker_threads");

const lib = require("./lib");

if (isMainThread) {
  module.exports = async function scrap(id, season) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { id, season }
      });
      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", code => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  };
} else {
  lib.getEpisode(workerData.id, workerData.season, (error, data) => {
    parentPort.postMessage(data);
  });
}
