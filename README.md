# KVStorage

### Conchbrain club offical KV Storage

WebApi Based Key Value Pair Storage

## Set Data

Api: https://storage.conchbrain.club/demo/set

Method: PUT

Content-Type: application/json

Para:
     Custom bucket name (eg. demo)
     Request body with key and value ( key must be a string )

#### Example

```shell
curl -X PUT 'https://storage.conchbrain.club/demo/set' \
    -H 'Content-Type: application/json;' \
    -d '{ "key": "Hi", "value": "ConchBrain KVStorage" }'
```

> Response: "Put successful"

## Get Data

Api: https://storage.conchbrain.club/demo/get

Method: GET

Para:
     Custom bucket name (eg. demo)
     key
     
#### Example

```shell
curl https://storage.conchbrain.club/demo/get?Hi
```

> Response: "Welcome"

## Get All Data

Api: https://storage.conchbrain.club/demo

Method: GET

Para:
     Custom bucket name (eg. demo)
     
#### Example

```shell
curl https://storage.conchbrain.club/demo
```

> Response: JsonStr

## Delete Data

Api: https://storage.conchbrain.club/demo/delete

Method: DELETE

Para:
     Custom bucket name (eg. demo)
     key
     
#### Example

```shell
curl -X DELETE https://storage.conchbrain.club/demo/delete?hello
```
