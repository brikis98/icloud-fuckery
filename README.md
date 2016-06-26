# iCloud Fuckery

This repo contains a couple hacky node.js scripts I use whenever I need to download a large number of my photos (but not
all!) from iCloud:

* `list-all-photos.js`: Downloads the metadata for all of your photos, including name, creation date, download URL, etc
  into `all-photos.json`.
* `download-photos-after-date.js`: Downloads all the photos in `all-photos.json` that were created after the date
  specified in `DOWNLOAD_PHOTOS_AFTER_DATE`. Launches one process per CPU core so the downloads can happen in parallel.

**Note**: This is a very hacky script. It shouldn't have to exist, but iCloud is crap, and I used a spare afternoon to
cobble this stuff together so I could download my own photos. Do not expect much in terms of maintenance, tests, or
code quality.

## Motivation

I often want to download a large number of my photos from my iPhone, but find it impossible due to iCloud. This is
because iCloud automatically backs up the photos on your i-devices and then, after ~30 days, it removes the originals.
After that, there are only two ways to download those photos, and both have severe limitations:

1. Use the Photos app on your Mac to enable iCloud sync. This downloads *all* your photos to your hard drive, which if
   you have a lot of photos, takes a very long time and eats up a lot of disk space.
1. Use the [iCloud website](https://www.icloud.com/#photos) to download photos. This UI is fine for one or two photos,
   but since it pops up the "save file as..." dialog for each one photo you want to download, it's unusuable if you
   want to download several dozen or several hundred.

## Usage

1. Make sure [Node.js](https://nodejs.org/) is installed.
1. `npm install`.
1. `node list-all-photos.js`.
1. Enter your iCloud username and password at the prompt.
1. Wait a few minutes and the program will output a JSON blob with the info for all the photos in your account into
   `all-photos.json`.
1. Open `download-photos-after-date.js` and set the `DOWNLOAD_PHOTOS_AFTER_DATE` and `DEST_FOLDER` variables to
   appropriate values.
1. `node download-photos-after-date.js`.

Note that the URLs in `all-photos.json` use some sort of auth token system that expires after 30 minutes or an hour,
so if you wait to long between running `list-all-photos.js` and `download-photos-after-date.js`, the downloads URLs
may no longer work and the latter script will exit with an error.

## License

This code is released under the MIT License. See [LICENSE.txt](/LICENSE.txt).