// multer는 주로 파일업로드에 사용되는 모듈
import multer from "multer";

export const localsMiddleware = (req, res, next) => {
// locals로 저장하면 전역에서 사용가능한 전역변수가 된다 그래서 pug파일에서 별 다른거 없이 loggedIn 바로 쓸수있음
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

// 로그인을 하지 않은 사람이 edit 페이지에 접근하려고 할 때
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

// 로그인이 되어 있는 사람이 로그인 페이지에 접근하려고 할 때
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};

// multer을 사용하기 위한 미들웨어 사용자로부터 파일을 받으면 저자할곳을 uploads폴더에 저장해라는 미들웨어
// limits 파일 용량 제한
export const avatarUpload = multer({ dest: "uploads/avatars/" , limits: {fileSize:300000,},});
export const videoUpload = multer({ dest: "uploads/videos/", limits: {fileSize:100000000,},});
