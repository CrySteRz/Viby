const winston = require("winston");
const colors = require("colors");
class Logger {
  constructor(file) {
    this.logger = winston.createLogger({
      transports: [new winston.transports.File({ filename: file })],
    });
  }
  log(Text) {
    let d = new Date();
    this.logger.log({
      time: `${d.getDate()}:${d.getMonth()+1}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}` , 
      level: "warn",
      message: Text,
    });
    console.log(
      colors.gray(
        `[${d.getDate()}:${d.getMonth()+1}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`
      ) + colors.blue(" | " + Text)
    );
  }
  error(Text) {
    let d = new Date();
    this.logger.log({
      time: `${d.getDate()}:${d.getMonth()+1}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}` , 
      level: "error",
      message: Text,
    });
    console.log(
      colors.gray(
        `[${d.getDate()}:${d.getMonth()+1}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`
      ) + colors.red(" | " + Text)
    );
  }
}
module.exports = Logger;