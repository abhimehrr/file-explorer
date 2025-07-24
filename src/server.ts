// Environment Variables
import env from "dotenv";
env.config();

// -----------------------------------------------------

import express from "express";
const app = express();

import cookieParser from "cookie-parser";
import { fileReader } from "./controller/file-reader.controller";
import path from "path";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use(express.static("view"));

// Routes
app.get("/", (req, res) => {
  // console.log("Cookie: ", req.cookies);

  return res.status(200).sendFile(path.join(__dirname, "view", "login.html"));
});

// File Explorer
app.get("/explorer", (req, res) => {
  return res
    .status(200)
    .sendFile(path.join(__dirname, "view", "file-explorer.html"));
});

// File Reader
app.get(
  "/files",
  fileReader([
    // { dirName: "some", dirPath: "a:/f", ignoreDirs: ["node_modules"] },
    {
      dirName: "@root",
      dirPath: ".",
      ignoreDirs: ["node_modules"],
    },
  ])
);

// Server Listening
app.listen(process.env.PORT, () => {
  console.log(`Server is running >> http://localhost:${process.env.PORT}`);
});
