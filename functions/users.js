"use strict";
const AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient();

module.exports.getUserStatus = async (event) => {
    const user = event.requestContext.authorizer.lambda.user;
    const dbParams = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: { email: user },
    }
    const result = await db.get(dbParams).promise();
    const status = result.Item.userStatus || '';

    return { statusCode: 200, body: JSON.stringify({ user, status }) }
};

module.exports.updateUserStatus = async (event) => {
    const user = event.requestContext.authorizer.lambda.user;
    const body = JSON.parse(event.body);

    if(typeof body.status !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: "Invalid request" }) }
    }
    
    const dbParams = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: { email: user },
        UpdateExpression: "SET userStatus = :s",
        ExpressionAttributeValues: {
            ":s": body.status
        }
    }

    await db.update(dbParams).promise();

    return { statusCode: 200, body: JSON.stringify({ user, status: body.status }) }
};