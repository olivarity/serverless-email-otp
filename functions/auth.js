'use strict';
const AWS = require('aws-sdk');
const { randomInt } = require('node:crypto');
const jwt = require('jsonwebtoken');

const OTP_TTL = 15; // in minutes

const db = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();

module.exports.sendEmail = async (event) => {
    const body = JSON.parse(event.body);

    const otpCode = randomInt(999999).toString().padStart(6, '0');
    const expTime = new Date(Date.now() + OTP_TTL * 60000).toISOString();

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

    const sesParams = {
        Destination: { ToAddresses: [body.email] },
        Message: { 
            Subject: { Data: "Cool OTP Email"},
            Body: {
                Text: { Data: `Your code is ${otpCode}`}
            }
        },
        Source: process.env.SENDER_ADDRESS
    };

    await ses.sendEmail(sesParams).promise();

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
            const token = jwt.sign(
                { user: body.email }, 
                process.env.JWT_SECRET, 
                { expiresIn: 3600 });
            return { statusCode: 200, body: JSON.stringify({ token })}
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

module.exports.validateToken = (event, context, callback) => {
    console.log(JSON.stringify(event));
    const token = event.authorizationToken;
    try {
        const decodedToken = jwt.verify(event.headers.authorization, process.env.JWT_SECRET);
        const policyDocument = {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: event.routeArn
                }
            ]
        }
        const response = {
            principalId: 'user',
            policyDocument,
            context: decodedToken
        }
        console.log(JSON.stringify(response));
        callback(null, response);
    } catch {
        callback("Unauthorized");
    }
    
}