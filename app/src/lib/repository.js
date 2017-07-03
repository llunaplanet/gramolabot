"use strict";

module.exports = function DynamoDbRepository(AWS, tableName, hashKey, sortKey) {

    var docClient = new AWS.DynamoDB.DocumentClient();
    var debug = require('debug')('DynamoDB:Repository');

    function query(options, callback) {

        // You must specify a partition key value; the sort key is optional.

        options.filter = options.filter || null;

        let params = {
            TableName: tableName,
            KeyConditionExpression: hashKey + " = :partitionkeyval",
            ExpressionAttributeValues: {
                ":partitionkeyval": options.partitionKey
            }
        };

        if(options.filter) {
            var expression = [
                options.filter.key,
                options.filter.condition,
                ":filterAttributeValue"
            ]
            params["FilterExpression"] = expression.join(" ");
            params["ExpressionAttributeValues"][":filterAttributeValue"] = options.filter.value;
        }

        docClient.query(params, function(err, data) {
            if (err) return callback(err, null);
            callback(err, data.Items);
        });
    }

    function findBy(id, sort, callback) {
        if(typeof(sort)=="function") {
            findByPrimaryKey(id, sort)
        }
        else {
            findByPrimaryKeyAndShortKey(id, sort, callback)
        }
    }

    function findByPrimaryKeyAndShortKey(id, sort, callback) {
        let params = {
            TableName: tableName,
            Key: {}
        };
        params.Key[hashKey] = id;
        params.Key[sortKey] = sort;

        debug('findBy[%s] = %s',hashKey, id);

        docClient.get(params, function (err, result) {
            if (err) return callback(err, null);
            callback(null, result.Item || null);
        });
    }


    function findByPrimaryKey(id, callback) {
        let params = {
            TableName: tableName,
            Key: {}
        };
        params.Key[hashKey] = id;

        debug('findBy[%s] = %s',hashKey, id);

        docClient.get(params, function (err, result) {
            if (err) return callback(err, null);
            callback(null, result.Item || null);
        });
    }

    function addOrReplace(item, callback) {
        let params = {
            TableName: tableName,
            Item: item
        };

        debug('addOrReplace[%s] = %s',hashKey, item[hashKey]);

        docClient.put(params, function(err, data) {
            if(!err) debug("Created doc with hashKey [%s]", item[hashKey]);
            callback(err);
        });
    }

    function removeBy(id, sort, callback) {
        if(typeof(sort)=="function") {
            removeByPrimaryKey(id, sort)
        }
        else {
            removeByPrimaryKeyAndSortKey(id, sort, callback)
        }
    }

    function removeByPrimaryKey(id, callback) {
        let params = {
            TableName: tableName,
            Key: {}
        };
        params.Key[hashKey] = id;
        docClient.delete(params, function (err, data) {
            if (!err) debug("Deleted doc with hashKey [%s]", id);
            callback(err)
        })
    }

    function removeByPrimaryKeyAndSortKey(id, sort, callback) {
        let params = {
            TableName: tableName,
            Key: {}
        };
        params.Key[hashKey] = id;
        params.Key[sortKey] = sort;
        docClient.delete(params, function (err, data) {
            if (!err) debug("Deleted doc with hashKey:sortKey [%s:%s]", id, sort);
            callback(err)
        })
    }

    function createTable(callback) {

        var dynamodb = new AWS.DynamoDB();

        var params = {
            TableName : tableName,
            KeySchema: [
                { AttributeName: hashKey, KeyType: "HASH"}
            ],
            AttributeDefinitions: [
                { AttributeName: hashKey, AttributeType: "S" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        };

        if(sortKey!=undefined) {
            params.KeySchema.push({
                AttributeName: sortKey, KeyType: "RANGE"
            });
            params.AttributeDefinitions.push({
                AttributeName: sortKey, AttributeType: "S"
            });
        }

        dynamodb.createTable(params, function(err, data) {
            if(!err) debug("Created table [%s], status [%s]", data.TableDescription.TableName,data.TableDescription.TableStatus);
            callback(err);
        });
    };

    function mapDocToObject(obj, doc, excludeKeys) {

        Object.keys(doc).forEach(function(key) {
            if(!obj.hasOwnProperty(key)) return;
            obj[key] = doc[key];
        });
    }

    function mapObjectToDoc(obj, excludeKeys) {

        var doc = {};
        var keys = Object.keys(obj).filter(function(key) {

            if(excludeKeys && excludeKeys.length) {
                if(excludeKeys.indexOf(key)!=-1) return false
            }
            return true;
        });

        keys.forEach(function(key){
            doc[key] = obj[key];
        });

        return doc;
    }

    function deleteTable(callback) {
        var dynamodb = new AWS.DynamoDB();

        var params = {
            TableName : tableName
        };

        dynamodb.deleteTable(params, function(err, data) {
            if (!err) debug("Deleted table [%s]", data.TableDescription.TableName);
            callback(err);
        });
    };

    return {
        mapObjectToDoc: mapObjectToDoc,
        mapDocToObject: mapDocToObject,
        createTable: createTable,
        deleteTable: deleteTable,
        query: query,
        findBy: findBy,
        addOrReplace: addOrReplace,
        removeBy: removeBy
    };
};
