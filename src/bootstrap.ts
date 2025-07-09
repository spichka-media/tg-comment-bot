import fs from "fs";

const logStream  = fs.createWriteStream("./log.txt", {flags: 'a'});
console.log = (...data: any) => { 
    logStream.write(`${new Date().toLocaleString()} [LOG] ${data}\n`);
}
console.error = (...data: any) => {
    logStream.write(`${new Date().toLocaleString()} [ERR] ${data}\n`);
}