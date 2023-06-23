import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");


// express가  views디렉토리에서 pug파일을 찾도록 설정하는 메소드
app.set("view engine", "pug");
// server위치 기준으로 views위치를 잡아줘야해서 사용
app.set("views", process.cwd() + "/src/views");
app.use(logger);
// express가 form의 value를 이해할 수 있도록 도와주고 자바스크립트 형식으로 변형해줌
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.COOKIE_SECRET, // 쿠키에 sign할때 사용하는거라는데 매우 길고 비밀스럽게 작성해야함
        resave: false, //  resave는 모든 req마다 세션의 변경사항이 있든 없는 세션을 계속해서 저장한다 ㅋ
        saveUninitialized: false, // uninitialized상태인 세션을 저장한다 uninitialized이란 req때 생성된 이후로 아무런 작업이 가해지지않는 초기상태의 세션을 말한다
        // 백엔드가 로그인한 사용자에게만 쿠키를 주록 설정됐다는 말이라고 보면 된다.
        store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
        // cookie: {
        //     maxAge:20000, // 쿠키의 유효시간을 정할수있음
        // }, 
    })
);

app.use(localsMiddleware);
// 브라우저가 서버에 있는 폴더를 접근가능하게 하는 메소드
app.use("/uploads", express.static("uploads"))
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
