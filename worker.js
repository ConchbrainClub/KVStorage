addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

//Handle http qequest
async function handleRequest(request) {
    return rotate(request);
}

let welcomePage = `
    <div style="text-align:center; margin-top: 100px;">
        <p>Welcome to ConchBrain KVStorage</p>
        <p>Please read the <a href="https://conchbrain.club/#kvstorage" target="_blank">documentation</a></p>
    </div>
`;

//Standard response
function response(stateCode, content, contentType) {
    if(contentType == null)
        contentType = "text/plain;charset=UTF-8";

    return new Response(content, {
        status: stateCode,

        //CORS header proxy
        headers: {
            "content-type": contentType,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    });
}

//Rotate
async function rotate(request) {
    let url = new URL(request.url);

    let rotatePara = parsePara(url.pathname);
    
    if(!rotatePara.bucket)
        return response(200, welcomePage, "text/html");
    
    switch(rotatePara.path) {
        case "/":
            let list = (await Storage.list({"prefix": `${rotatePara.bucket}@`})).keys;
            let results = new Array();

            for(let i=0;i<list.length;i++) {
                let key = list[i].name.replace(rotatePara.bucket + "@", "");
                let value = JSON.parse(await Storage.get(list[i].name));

                results.push({
                    "key": key,
                    "value": value
                });
            }

            return response(200, JSON.stringify(results));

        case "/get":
            if(!url.search)
                return response(403, "Parameter is empty");

            let para = rotatePara.bucket + "@" + decodeURI(url.search.replace("?",""));
            let result = await Storage.get(para);

            if(result)
                return response(200,result);

            return response(404, "not found");

        case "/set":

            if(request.method == "OPTIONS")
                return response(200, "OK");

            if(request.method != "PUT")
                return response(403, "Method is not support");

            try{
                if(!request.headers.get("Content-Type").includes("application/json"))
                    return response(403, "Content-Type is not support");
            }
            catch{
                return response(403, "Need Content-Type");
            }
            
            let data = null;
            try{
                data = await request.json();
            }
            catch{
                return response(403, "Parse json error")
            }

            let verifyResult = verifyData(data);
            if(!verifyResult.flag)
                return response(403, verifyResult.msg);

            await Storage.put(rotatePara.bucket + "@" + data.key, JSON.stringify(data.value));
            return response(200, "Put successful");

        case "/delete":

            if(request.method != "DELETE")
                return response(403, "Method is not support");

            if(!url.search)
                return response(403, "Parameter is empty");
            
            await Storage.delete(`${rotatePara.bucket}@${decodeURI(url.search.replace("?",""))}`);
            return response(200, "Delete successful");

        default:
            return response(404, "NotFound");
    }
}

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

//Verify FormData is not null or empty
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
