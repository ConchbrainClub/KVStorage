# KVStorage

### Conchbrain club offical KV Storage

WebApi Based Key Value Pair Storage

## Set Data

Api: https://www.conchbrain.club/storage/demo/set

Method: PUT

Content-Type: application/json

Para:
     Custom bucket name (eg. demo)
     Request body with key and value ( key must be a string )

#### Example

```shell
curl -X PUT 'https://www.conchbrain.club/storage/demo/set' \
    -H 'Content-Type: application/json;' \
    -d '{ "key": "Hi", "value": "ConchBrain KVStorage" }'
```

> Response: "Put successful"

## Get Data

Api: https://www.conchbrain.club/storage/demo/get

Method: GET

Para:
     Custom bucket name (eg. demo)
     key
     
#### Example

```shell
curl https://www.conchbrain.club/storage/demo/get?Hi
```

> Response: "Welcome"

## Get All Data

Api: https://www.conchbrain.club/storage/demo

Method: GET

Para:
     Custom bucket name (eg. demo)
     
#### Example

```shell
curl https://www.conchbrain.club/storage/demo
```

> Response: JsonStr

## Delete Data

Api: https://www.conchbrain.club/storage/demo/delete

Method: DELETE

Para:
     Custom bucket name (eg. demo)
     key
     
#### Example

```shell
curl -X DELETE https://www.conchbrain.club/storage/demo/delete?hello
```
