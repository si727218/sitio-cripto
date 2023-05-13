const fs = require('fs');
const path = require('path');
const https = require('https');
const React = require('react');
const moment = require('moment');
const argon2 = require('argon2');
const express = require("express");
const Webcam = require('react-webcam');
const bodyParser = require('body-parser');

const options = {
  key: fs.readFileSync('certs/key.pem'),
  cert: fs.readFileSync('certs/cert.pem'),
};

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req, res) =>{
    res.render('index.ejs', {root: __dirname});
  });

  app.post("/api/register", (req, res) => {
    res.render('newuser.ejs', {root: __dirname});
  });

  app.post("/api/verify", async (req, res) => {
    const { userId, secret } = req.body;
  
    const filePath = path.join(__dirname, "credentials.json");
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const users = JSON.parse(fileContents);
  
    const user = users.find((user) => user.username === userId);
  
    if (!user) {
      res.status(418).send("Invalid information");
      return;
    }
  
    const passwordMatch = await argon2.verify(user.password, secret);
  
    if (!passwordMatch) {
      res.status(418).send("Invalid information");
      return;
    }
    date = user.lastLoginDate;
  
    user.lastLoginDate = new Date();
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  
    //res.status(200).send(`Login successful. Your last login date was ${date}`);
    console.log(`Login successful. Your last login date was ${date}`);
    res.status(200).render('nft.ejs', {
      root: __dirname,
      message: `Login successful. Your last login date was ${date}`
    });  });

  app.post("/api/regist", async(req, res) => {
    const { userId, secret, confirmsecret } = req.body;
    if (secret === confirmsecret) {
      const hash = await argon2.hash(secret);
      const data = {
        username: userId,
        password: hash
      };
      
      const filePath = path.join(__dirname, 'credentials.json');
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      let users = JSON.parse(fileContents);
      
      if (!Array.isArray(users)) {
        users = [data];
      } else {
        users.push(data);
      }
      
      fs.writeFile(filePath, JSON.stringify(users), (err) => {
        if (err) {
          console.error(err);
          res.status(418).send('Error saving credentials');
        } else {
          console.log('Credentials saved successfully');
          res.status(200).send('Credentials saved successfully');
        }
      });
      res.status(200).send('User registered succesfully!');
    } else {
      res.status(418).send('Passwords dont match!');
    }
  });
  
  const WebcamComponent = function() {
    return React.createElement(Webcam, null);
  }

const port = 8000;
https.createServer(options, app).listen(port, () => {
  console.log(`App is running on PORT: ${port}.`);
});