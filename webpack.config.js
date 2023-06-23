const path = require("path")

console.log( )

module.exports = {
    // entry는 우리가 변경하고자 하는 파일
    // 작업이 끝난 후에 파일은 path 경로 파일명은 filename
    entry: "./src/client/js/main.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "assets", "js"),
    },

};

// __dirname, 파일까지의 경로 전체