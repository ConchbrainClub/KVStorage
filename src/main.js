const http = require("http");
const redis = require("redis");

const client = redis.createClient();

client.on("error", function(error) {
    console.error(error);
});

let welcomePage = `
<div style="text-align:center; margin-top: 100px;">
    <p>Welcome to ConchBrain KVStorage</p>
    <p>Please read the <a href="https://conchbrain.club/#kvstorage" target="_blank">documentation</a></p>
</div>
`;

http.createServer((req,res)=>{
    
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    res.setHeader("Access-Control-Allow-Methods","*");
    res.setHeader("content-type","text/plain; charset=UTF-8")

    let url = new URL(req.url,"http://localhost:8080");
    let rotatePara = parsePara(url.pathname);

    if(!rotatePara.bucket){
        res.setHeader("content-type","text/html; charset=UTF-8")
        return res.end(welcomePage);
    }
    
    switch(rotatePara.operation) {
        case "/":
            let bucket = rotatePara.bucket + "@*";

            let page = "0";
            if(url.search)
                page = url.search.replace("?","");

            if(isNaN(Number(page)))
                return res.end("page is not a num");

            client.scan(page,"match",bucket,"count","100",(err,replay) => {
                if(err)
                    return res.end("get bucket error");
                let result = {
                    "next": 0,
                    "keys": []
                };
                result.next = replay[0]
                replay[1].forEach((element) => {
                    let start = element.indexOf("@");
                    result.keys.push(element.substring(start+1));
                });
                return res.end(JSON.stringify(result));
            });
            break;

        case "/get":
            if(!url.search)
                return responseError(res,"Parameter is empty");
            
            let key = rotatePara.bucket + "@" + decodeURI(url.search.replace("?",""));
            
            client.get(key,(err,replay) => {
                if(err)
                    return res.end("get value error");
                return res.end(replay);
            });
            break;

        case "/set":

            if(req.method != "PUT")
                return responseError(res,"method is not support");

            if(!req.headers["content-type"].includes("application/json"))
                return responseError(res,"content-type is not support");

            let data = "";

            req.on("data",(chunk) => {
                data += chunk;
            })

            req.on("end",()=>{
                data = JSON.parse(data);
                let verifyResult = verifyData(data);
                if(!verifyResult.flag)
                    return responseError(res,verifyResult.msg);

                client.set(rotatePara.bucket + "@" + data.key, JSON.stringify(data.value));
                return res.end("put successful");
            });
            break;

        case "/delete":
            let delKey = rotatePara.bucket + "@" + url.search.replace("?","");
            if(client.DEL(delKey))
                return res.end("delete successful");
            return res.end("delete defeat");
        
        default:
            responseError(res,"not found");
    }
    

}).listen(8080,()=>{
    console.log("server listen at port 8080");
});

function responseError(res,warning){
    res.statusCode = 403;
    res.end(warning);
}

function parsePara(fullPathName) {

    try{
        let result = new RegExp("/[a-zA-Z0-9]+").exec(fullPathName)[0];

        let bucket = result.replace("/","");
        let operation = fullPathName.replace(result,"");

        if(!operation)
            operation = "/";

        return {
            "bucket": bucket,
            "operation": operation
        };
    }
    catch{
        return {
            "operation": fullPathName
        };
    }
}

function verifyData(data) {
    
    if(!data.key || !data.value)
        return {
            "flag": false,
            "msg": "Data is not perfect"
        };
    if(typeof(data.key)!="string")
        return {
            "flag": false,
            "msg": "Key must be a string"
        };
        
    return {
        "flag": true
    };
}
