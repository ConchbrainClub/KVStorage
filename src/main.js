const http = require("http");
const url = require("url");

http.createServer((req,res)=>{
    
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","*");

    let pathName = url.parse(req.url);
    let rotatePara = parsePara(pathName);

    

}).listen(8080,()=>{
    console.log("server listen at port 8080");
});

function parsePara(fullPathName) {

    try{
        let result = new RegExp("/[a-zA-Z0-9]+").exec(fullPathName)[0];

        let bucket = result.replace("/","");
        let path = fullPathName.replace(result,"");

        if(!path)
            path = "/";

        return {
            "bucket": bucket,
            "path": path
        };
    }
    catch{
        return {
            "path": fullPathName
        };
    }
}
