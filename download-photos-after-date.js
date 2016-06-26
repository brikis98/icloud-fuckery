// Download the photos in all-photos.json that were created after DOWNLOAD_PHOTOS_AFTER_DATE to the folder
// DEST_FOLDER.

// Update these variables for your own use-case
var DOWNLOAD_PHOTOS_AFTER_DATE = new Date(2016, 2, 18); // Note: the month is 0 based
var DEST_FOLDER = "/Users/brikis98/Pictures/photo-download-2";

var fs = require('fs');
var http = require('https');
var path = require('path');
var cluster = require('cluster');
var process = require('process');
var _ = require('underscore');
var async = require('async');

var NUM_CPUS = require('os').cpus().length;

var PHOTOS = JSON.parse(fs.readFileSync('all-photos.json', 'utf8'));
var PHOTOS_AFTER_DATE = _.values(PHOTOS).filter(function(photo) {
  var createdDate = new Date(photo["createdDate"]);
  return createdDate.getTime() > DOWNLOAD_PHOTOS_AFTER_DATE.getTime();
});
var PHOTO_PARTITIONS = _.values(_.groupBy(PHOTOS_AFTER_DATE, function(photo, i) { return Math.floor(i % NUM_CPUS); }));

var downloadPhoto = function(photo, callback) {
  var photoVersions = photo["versions"];
  var createdDate = photo["createdDate"];
  var originalPhoto = photoVersions["original"];
  var url = originalPhoto["url"];
  var filename = originalPhoto["filename"];
  var destPath = path.join(DEST_FOLDER, createdDate + "_" + filename);

  console.log("Downloading " + filename + " from URL " + url + " to " + destPath);

  var file = fs.createWriteStream(destPath);
  var request = http.get(url, function(response) {
    if (response.statusCode !== 200) {
      return callback('Expected a 200 response, but instead got ' + response.statusCode);
    }
    response.pipe(file);
    file.on('finish', function() {
      file.close(function(err) {
        console.log('Finished and closed');
        callback(err);
      })
    });
  }).on('error', function(err) {
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    callback(err);
  });
};

// The master launches one worker per CPU core and waits for them to all exit
var runMaster = function() {
  var completed = 0;

  for (var i = 0; i < NUM_CPUS; i++) {
    var worker = cluster.fork();

    worker.on('exit', function() {
      console.log("Worker " + worker.id + " exited.");
      completed++;
      if (completed == NUM_CPUS) {
        console.log("All workers exited.");
        process.exit();
      }
    });
  }
};

// Each worker downloads a subset of the photos
var runWorker = function() {
  // The worker id is 1-based for some reason. Perhaps the master is 0?
  var workerPartition = PHOTO_PARTITIONS[cluster.worker.id - 1];
  console.log("Worker " + cluster.worker.id + " starting to download " + workerPartition.length + " photos.");

  async.reduce(workerPartition, null, function(total, photo, callback) {
    downloadPhoto(photo, function(err) {
      callback(err, err ? total : total + 1);
    });
  }, function(err, total) {
    console.log('Worker ' + cluster.worker.id + ' downloaded ' + total + ' photos.');

    if (err) {
      console.log('Worker ' + cluster.worker.id + ' exited with an error: ' + err);
    }

    // Need to call this or the master process never terminates
    process.exit();
  });
};

if (cluster.isMaster) {
  runMaster();
} else {
  runWorker();
}


