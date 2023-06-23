import "dotenv/config"; // dotenv모듈을 사용하면 process.env를 사용해서 .env파일의 변수들을 볼수있음 
import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 4000;

const handleListening = () =>
  console.log(`✅ Server listenting on http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
