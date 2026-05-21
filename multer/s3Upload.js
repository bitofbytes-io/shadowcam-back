const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const { db } = require("../database/db");
const sql = require("../database/sql");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  },
  region: "us-west-1"
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "shadowcam-back",
    acl: "public-read",
    key: function(req, file, cb) {
      let video_id;
      db.any(sql.videos.addVideo, req.body)
        .then(result => {
          if (result[0]) {
            video_id = result[0].video_id;
            const filename = `${video_id}.webm`;
            // If able to insert into video table, name the file the after
            // video_id.
            cb(null, filename);
          }
        })
        // will catch error if missing any data on the insertion
        .catch(err => {
          console.log(err);
        });
    }
  })
});

module.exports = upload;
