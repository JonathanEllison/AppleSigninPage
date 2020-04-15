#!/usr/bin/env node

const express = require('express')
const request = require('request');
const bodyParser = require('body-parser')
var path = require('path');
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/loginAS.html'));

})

app.get('/getApplePayload', (req, res) => {
    res.sendFile(path.join(__dirname + '/getCredentialsAS.html'));
})

app.get('/test/', (req, res) => {
    res.sendFile(path.join(__dirname + '/login.html'));

})

app.get('/test/getApplePayload', (req, res) => {
    res.sendFile(path.join(__dirname + '/getCredentials.html'));
})

app.post('/callback', bodyParser.urlencoded({extended: false}), (req, res) => {    
    // res.status(200).json({
    //     "message": `To create a user send the id token to the /identity endpoint. To login send both the code and token to the /login endpoint`,
    //     "code": req.body.code,
    //     "id_token": req.body.id_token
    // })
    let debug = req.query.displayCredentials
    console.log(debug)
    sendRequestToApi(req.body.code, req.body.id_token)
    .then(result => {
        res.status(200).json(result)
    })
    .catch(error => {
        res.status(400).json({"message": "Error in logging in", "data": error})
    });
})

app.post('/displayCredentials', bodyParser.urlencoded({extended: false}), (req, res) => {    
    res.status(200).json({
        "code": req.body.code,
        "id_token": req.body.id_token
    })
})

function sendRequestToApi(principal, cred) {
    let body = {
        "principal": principal,
        "credential": cred,
        "identityType": "APPLE",
        "apps": []
    };
    
    return new Promise(function(resolve, reject){
        request.post({
            url: "https://audience.qa.adultswim.com/core/api/1/user/login",
            headers: {
                "Content-Type": "application/json",
                "X-Client-Application": "JEllison-Test-Adultswim-QA"
            },
            body: JSON.stringify(body)
        }, function callback(err, httpResp, data) {
            let httpStatus = Math.floor(httpResp.statusCode / 100);

            if(httpStatus == 2) {
                resolve({
                    "status": httpResp.statusCode,
                    "message": "Success",
                    "data": data
                })
            }
            else {
                console.log(err, httpResp.statusCode);
                reject(new Error("There was an error in logging in. See logs"))
            }
            
        })    
    })
}

app.listen(port, () => console.log(`Apple Sign In Redirection app listening on port ${port}!`))