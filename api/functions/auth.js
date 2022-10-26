'use strict';
const AWS = require('aws-sdk');
const { randomInt } = require('node:crypto');

const db = new AWS.DynamoDB.DocumentClient();

module.exports.sendEmail = async (event) => {
    const otpTtl = 15; // in minutes

    const body = JSON.parse(event.body);

    const otpCode = randomInt(999999).toString().padStart(6, '0');
    const expTime = new Date(Date.now() + otpTtl * 60000).toISOString();

    const dbParams = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: { email: body.email },
        UpdateExpression: "SET code = :c, codeExp = :e",
        ExpressionAttributeValues: {
            ":c": otpCode,
            ":e": expTime
        }
    }

    await db.update(dbParams).promise()

    // TODO: Email Logic

    return { statusCode: 200, body: `Email sent. Code expires at ${expTime}` }
}

module.exports.validateCode = async (event) => {
    const body = JSON.parse(event.body);

    const dbParams = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: { email: body.email }
    }

    const result = await db.get(dbParams).promise();
    const record = result.Item;

    console.log(record);

    if(record.codeExp && new Date(record.codeExp) > new Date()) {
        if(record.code == body.code) {
            await clearCode(body.email);
            return { statusCode: 200, body: "success, issue auth token" }
        }

        return { statusCode: 400, body: "failure, increment retries"}
    }
    
    await clearCode(body.email);
    return { statusCode: 200, body: "no active challenge, redirect to /login"}
}

const clearCode = async (email) => {
    const dbParams = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: { email: email },
        UpdateExpression: "REMOVE code, codeExp",
    }

    return await db.update(dbParams).promise();
}