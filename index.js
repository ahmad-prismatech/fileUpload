const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const User = require("./User.Model");

app.use(cors());

// app.use(express.static(path.join(__dirname, "/client/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname + "/client/build/index.html"));
// });

app.use(
  fileUpload({
    useTempFiles: true, //create temporary files for production
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true, //create automatically upload folder if not available
  })
);

const db = "mongodb://localhost:27017/uploadFile";
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Connected to ${db}...`))
  .catch((err) => {
    console.log(`DB Connection Error: ${err.message}`);
  });

app.get("/", (req, res) => {
  res.send("Working Initial Route!");
});

app.post("/single", async (req, res) => {
  try {
    const file = req.files.file;

    console.log(file);
    //if we upload same file with same name it will overwrite it so in order prevent this situation we have to declare our own file name
    //const fileName = new Date().getTime().toString() + path.extname(file.name);
    const savePath = path.join(__dirname, "public", "uploads", file.name);
    console.log("path: ", savePath);
    await file.mv(savePath);
    const userCreate = new User({
      photo: savePath,
    });
    await userCreate
      .save()
      .then((vision) => {
        console.log(vision);
        res.status(200).send({
          status: "200",
          message: "Success",
          data: vision,
        });
      })
      .catch((err) => {
        res.status(500).send({
          status: "500",
          message: err.message || "Error while saving in Database!",
        });
      });
    //fs.unlinkSync(savePath);
    debugger;
    res.status("200").send({
      status: "200",
      message: "Success",
      imagePath: savePath,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error uploading file",
    });
  }
});

app.post("/multiple", async (req, res) => {
  try {
    const files = req.files.mFile;
    console.log(files);
    //first method
    // let promises = [];
    // files.forEach((file) => {
    //   const savePath = path.join(__dirname, "public", "uploads", file.name);
    //   promises.push(file.mv(savePath));
    // });
    // await Promise.all(promises);
    // res.status(200).send({
    //   status: "200",
    //   message: "Success",
    // });
    //second method
    const promise = files.map((file) => {
      const savePath = path.join(__dirname, "public", "uploads", file.name);
      return file.mv(savePath);
    });
    await Promise.all(promise);
    res.status(200).send({
      status: "200",
      message: "Success",
      data: files.name,
    });
  } catch (err) {
    res.status(500).send({
      status: "500",
      message: "Error Uploading file",
    });
  }
});

app.listen(8000, () => {
  console.log("Server running on port 8000");
});
