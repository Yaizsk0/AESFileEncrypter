import express from "express";
import path from "path";
import CryptoJS from "crypto-js";
import http from "http";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));

app.use(express.static(path.resolve() + "/public"));

app.post("/encrypt", async (req, res) => {
  const { fileName, fileData } = req.body; // destructuring from req.body
  const encryptedFileData = await encryptFileToBase64(fileData);
  const responseText = `<FileAttachment>;${fileName};${encryptedFileData}`;
  res.send(responseText);
});

app.post("/decrypt", (req, res) => {
  const { fileName, encryptedBase64 } = req.body;
  const decryptedWordArray = CryptoJS.AES.decrypt(
    encryptedBase64,
    "mi_clave_de_encriptacion"
  );
  const decryptedBase64 = decryptedWordArray.toString(CryptoJS.enc.Utf8);

  // Convert base64 string to a buffer
  const decryptedBuffer = Buffer.from(decryptedBase64, "base64");

  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  res.send(decryptedBuffer); // The browser will download the file with the original name
});

const encryptFileToBase64 = async (fileData) => {
  const encryptionKey = "mi_clave_de_encriptacion";
  const encryptedWordArray = CryptoJS.AES.encrypt(fileData, encryptionKey);
  const encryptedBase64 = encryptedWordArray.toString();
  return encryptedBase64;
};

const server = http.createServer(app);
server.listen(3313, () => {
  console.log("Server is listening on port 3313");
  console.log("http://localhost:3313/");
});
