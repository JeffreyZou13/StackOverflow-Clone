const express = require('express')
const app = express();

const MongoClient = require('mongodb').MongoClient
const cors = require('cors')
const parser = require('body-parser')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const shortid = require('shortid')
const saltRounds = 15

app.use(cors())
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json())

let DBConnection = null; //use DBConnection to add to mongo collections ,set in line below

MongoClient.connect('mongodb://130.245.171.174:27017', { useNewUrlParser: true })
  .then((db) => DBConnection = db.db('stackOverflowDB')).catch((err) => console.log("NOOOOOO",err)) 

app.post('/adduser', (req, res) => {
    DBConnection.collection("users").findOne({email: req.body.email}, (err, DBres) => { //emails have to be unique
        if(DBres) res.send({status: "error", data: "exists"})
        else if(err) res.send({status: "error"})
        else {
            bcrypt.hash(req.body.pwd, saltRounds, (err, hash) => {
                if (err) res.send({status: "error"})
                else {
                    const theUser = {
                        username: req.body.username, 
                        password: hash, 
                        email: req.body.email,
                        isVerified: false
                    }
                    DBConnection.collection("users").insertOne(theUser, (DBerr, DBres) => { //insert new user
                        if(DBerr) res.send({status: "error"})
                    })
                }
            })
            let trans = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                user: 'brogrammers.cse356@gmail.com', 
                pass: 'ferdman123'
                }
            })
            const key = shortid.generate() //key that user has to enter
            const opt = {
                from: 'The Brogrammers',
                to: req.body.email,
                subject: 'StackOverflow: Verify Account',
                text: `${req.body.username}, Please enter the following key (without the brackets): <${key}>`,
            }
            trans.sendMail(opt)
            res.send({status: "OK", data: key})
        }
    })
})

app.post('/logout', (req, res) => res.send({status: "OK"})) //useless but doc says we need it

app.post('/verify', (req, res) =>{
    DBConnection.collection("users").updateOne({email: req.body.email}, {$set:{isVerified:true}}, (err, DBres) =>{
        if (err) res.send({status: "error"})
    })
    res.send({status: "OK"})
})

const portNum = process.env.PORT || 4000
app.listen(portNum, () => console.log("Web server listening on port 4000..."))