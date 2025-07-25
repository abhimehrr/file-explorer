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
