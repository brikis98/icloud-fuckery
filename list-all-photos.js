// Login to iCloud and save all the metadata for all of your photos to all-photos.json

var iCloud = require('icloud-api');
var prompt = require('prompt');
var fs = require('fs');

prompt.start();

var schema = {
  properties: {
    email: {
      message: 'iCloud email',
      required: true
    },
    password: {
      message: 'iCloud password',
      hidden: true,
      required: true
    }
  }
};

prompt.get(schema, function (err, result) {
  var client = new iCloud();

  console.log("Logging in...");

  client.login({
    apple_id : result.email,
    password : result.password,
  }, function(err) {
    if(err) { throw err; }

    console.log("Loading session...");

    client.loadSession(client.session, function(err) {
      if(err) { throw err; }

      console.log("Fetching albums...");

      client.photo.fetchAlbums(function(err, albums){
        if(err) { throw err; }

        console.log("Fetching media info for all-photos album...");

        var allPhotosAlbum = albums["all-photos"];
        client.photo.fetchMedias(allPhotosAlbum, function(err, medias){
          if(err) { throw err; }
          console.log("Writing results to all-photos.json");
          fs.writeFileSync('all-photos.json', JSON.stringify(medias, null, 2), 'utf8');
        });
      });
    });
  });
});

