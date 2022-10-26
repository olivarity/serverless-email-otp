# Serverless Framework Paswordless Sign-in
This repo serves as a basic prototype for implementing passwordless authentication on Serverless framework using OTP delivery over email.

## URLs
- API: https://om6evmhe19.execute-api.us-east-1.amazonaws.com/
- Web UI: http://serverless-email-otp-assets.s3-website-us-east-1.amazonaws.com/

## API Spec 
### POST /auth/login
Provided an email address, generates a new 6-digit OTP and sends to user email (if verfied in SES sandbox)

Example Request Body: 
```
{
  "email": "test@example.com"  
}
```

### POST /auth/login/challenge
Attempts to complete an OTP challenge for a given user. Will only succeed if OTP was issued within the last 15 minutes. Upon success, responds with a signed JWT valid for one hour.

Example Request Body:
```
{
  "email": "test@example.com",
  "code": "123456" 
}
```

Example Response Body: 
```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoib2xpdmlhQHNjYWFzaWMuY29tIiwiaWF0IjoxNjY2NzQ5NDQ2LCJleHAiOjE2NjY3NTMwNDZ9.sY_dO05susKF8R5jGyl0VOURyyESzk1lJhcK1gtr6P4"
}
```

### GET /users
Protected endpoint using a custom lambda authorizer. Requires a valid JWT in the `Authorization` header.

Example Response Body: 
```
{
  "user": "test@example.com",
  "status": "Listening to Disloyal Order of Water Buffaloes"  
}
```

### POST /users
Protected endpoint using a custom lambda authorizer. Requires a valid JWT in the `Authorization` header.

Example Request Body: 
```
{
  "status": "My new status!"  
}
```

## TODO Features
- Login UI
- Unify React app and API under same origin
- Limit number of retries for an OTP challenge
- Better error messages