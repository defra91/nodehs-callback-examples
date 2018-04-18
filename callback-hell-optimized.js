'use strict';

const fs = require('fs');
const Async = require('async');
const gm = require('gm');
const path = require('path');

/** This is BAD **/
// fs.readdir(source, function (err, files) {
//   if (err) {
//     console.log('Error finding files: ' + err)
//   } else {
//     files.forEach(function (filename, fileIndex) {
//       console.log(filename)
//       gm(source + filename).size(function (err, values) {
//         if (err) {
//           console.log('Error identifying file size: ' + err)
//         } else {
//           console.log(filename + ' : ' + values)
//           aspect = (values.width / values.height)
//           widths.forEach(function (width, widthIndex) {
//             height = Math.round(width / aspect)
//             console.log('resizing ' + filename + 'to ' + height + 'x' + height)
//             this.resize(width, height).write(dest + 'w' + width + '_' + filename, function(err) {
//               if (err) console.log('Error writing file: ' + err)
//             })
//           }.bind(this))
//         }
//       })
//     })
//   }
// })

const source = process.env.SOURCE_DIR;
const dest = process.env.DEST_DIR;

const readDirectory = (source, cb) => {
  return fs.readdir(source, (err, files) => {
    if (err) console.log('Error finding files: ' + err);
    return cb(err, files);
  });
};

const getFileSize = (filename, cb) => {
  return gm(filename).size((err, values) => {
    if (err) console.log('Error identifying file size: ' + err);
    return cb(err, values);
  });
};

const resizeFile = (inputPath, outputPath, values, newWidth, cb) => {
  let aspect = (values.width / values.height);
  let height = Math.round(newWidth / aspect);
  console.log('resizing ' + inputPath + ' to ' + newWidth + 'x' + height);
  console.log('output path ' + outputPath);
  gm(inputPath).resizeExact(newWidth, height).noProfile().write(outputPath, (err) => {
    if (err) console.log('Error writing file: ' + err);
    return cb(err);
  });
};

const getFileSizeAndResize = (filename, cb) => {
  return Async.waterfall([
    (cb) => {
      return getFileSize(path.join(source, filename), cb);
    },
    (values, cb) => {
      return resizeFile(path.join(source, filename), path.join(dest, filename), values, 300, cb);
    }
  ], cb);
};

Async.auto({
  readDirectory: (cb) => {
    return readDirectory(source, cb);
  },
  resizeAllFiles: ['readDirectory', (results, cb) => {
    return Async.each(results.readDirectory, getFileSizeAndResize, cb);
  }]
}, (err) => {
  if (err) console.log(err);
  console.log('Finished');
});
