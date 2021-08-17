const fs = require("fs");
const express = require("express");
const fileUpload = require("express-fileupload");
const uid = require("uid");
const sizeOf = require("image-size");
const fetch = require("node-fetch");
const FormData = require("form-data");
const crypto = require('crypto');
const config = require("./config.json");

let recentFile = ""; // Bad workaround to prevent dupe files but it works

const app = express();
app.use(fileUpload());
app.post("/upload/:a/:b/", function (req, res) {
  if (!req.files) return res.status(500).send("No file uploaded");

  let newFileName;

  for (let k in req.files) {
    if (req.files.hasOwnProperty(k)) {
      (file => {
        console.log(file.name);
        if (file.name.indexOf("thumb") == -1) {
          const split = file.name.split(".");
          const ext = split.pop();
          if (ext == "jpg") return; // Lightshot should only capture PNG files, JPG is likely a thumbnail/dupe
          let fileName = uid(8) + "." + ext;
          let count = 1;

          while (fs.existsSync(config.uploadDir + "/" + fileName))
            fileName = `${uid(8)}.${ext})`;

          file.mv(config.uploadDir + "/" + fileName, function (err) {
            if (err) return res.status(500).send(err);
            let filePath = config.uploadDir + "/" + fileName;
            sizeOf(filePath, function (err, dimensions) {
              if (dimensions.width == 180 && dimensions.height == 180) { // Lightshot thumbnails are 180x180, so we ignore these to prevent double uploads
                console.log("Thumbnail detected");
                fs.unlinkSync(filePath);
                //res.status(500).send("Thumbnail disallowed");
                return;
              } else {

                const form = new FormData();
                const buffer = fs.readFileSync(filePath);

                const hash = crypto.createHash('sha256').update(buffer).digest('hex');
                if (hash == recentFile) {
                  console.log("Duplicate detected");
                  fs.unlinkSync(filePath);
                  //res.status(500).send("Duplicate file");
                  return;
                }
                recentFile = hash;

                form.append("file", buffer, {
                  contentType: "image/png",
                  name: "file",
                  filename: "file.png"
                });
                form.append("key", config.key); // upload.systems key

                fetch("https://api.upload.systems/images/upload", {
                  method: "POST",
                  body: form
                })
                  .then(res => res.json())
                  .then(json => {
                    newFileName = json.url;
                    const url = newFileName;
                    res.send(`
                  <response>
                    <status>success</status>
                    <url>${url}</url>
                    <thumb>${url}</thumb>
                  </response>
                  `);
                  })
                  .then(() => { fs.unlinkSync(filePath) });

              }
            });
          });
        }
      })(req.files[k]);
    }
  }
});

app.listen(config.listenPort);
