'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

module.exports.sendEmail = async (event) => {
    return { statusCode: 200, body: "login endpoint" }
}

module.exports.validateCode = async (event) => {
    return { statusCode: 200, body: "challenge endpoint" }
}