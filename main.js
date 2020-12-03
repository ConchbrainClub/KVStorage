addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

//Handle http qequest
async function handleRequest(request) {
    return rotate(request);
}

let welcomePage = `
    <p>Welcome to ConchBrain KVStorage</p>
    <p>Please read the <a href="https://conchbrain.club/#kvstorage" target="_blank">documentation</a></p>
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
            "Access-Control-Allow-Methods": "GET,POST",
            "Access-Control-Max-Age": "86400"
        }
    });
}

//Rotate
async function rotate(request) {
    let url = new URL(request.url);

    let rotatePara = parsePara(url.pathname);
    
    if(!rotatePara.user)
        return response(200, welcomePage, "text/html");
    
    switch(rotatePara.path) {
        case "/":
            let list = (await Storage.list({"prefix": `${rotatePara.user}@`})).keys;
            let results = new Array();

            for(let i=0;i<list.length;i++) {
                let key = list[i].name.replace(rotatePara.user + "@", "");
                let value = await Storage.get(list[i].name);

                results.push({
                    "key": key,
                    "value": value
                });
            }

            return response(200, JSON.stringify(results));

        case "/get":
            if(!url.search)
                return response(403, "Parameter is empty");

            let para = rotatePara.user + "@" + url.search.replace("?","");
            let result = await Storage.get(para);
            return response(200, result);

        case "/set":

            if(request.method != "POST")
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

            await Storage.put(rotatePara.user + "@" + data.key, JSON.stringify(data.value));
            return response(200, "Put successful");

        case "/delete":
            if(!url.search)
                return response(403, "Parameter is empty");
            await Storage.delete(`${rotatePara.user}@${url.search.replace("?","")}`);
            return response(200, "Delete successful");

        default:
            return response(404, "NotFound");
    }

}

function parsePara(fullPathName) {

    try{
        let result = new RegExp("/[a-zA-Z0-9]+").exec(fullPathName)[0];

        let user = result.replace("/","");
        let path = fullPathName.replace(result,"");

        if(!path)
            path = "/";

        return {
            "user": user,
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
    var result = {
        
    }
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
