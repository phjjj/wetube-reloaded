import express from "express";

const PORT = 4000;

const app = express();


const urlLogger = (req, res, next) => {
  console.log("PATH :" , req.path)
  next()
}
const timeLogger = (req, res, next) => {
  console.log("Time:", new Date().toLocaleDateString());
  next()
};
const securityLogger = (req, res, next) => {
  if (req.protocol === "http") {
    console.log("Insecure")
  } else {
    console.log("secure")
  }
  next();
};
const protectorMiddleware = (req, res, next) => {
  
  if (req.url === "/protected") {
    return res.send("<h1>Not Allowe</h1>")
  }
  console.log("Allowed")
  next()
};

app.use(urlLogger, timeLogger, securityLogger, protectorMiddleware)

app.get("/", (req, res) => res.send("<h1>Home</h1>"));
app.get("/protected", (req, res) => res.send("<h1>Protected</h1>"));

const handleListening = () =>
  console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
