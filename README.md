# Community Car Rentals

> Developed a web application for renting cars in your community, deployed on AWS EC2 instance, Node.js Express, Vue.js, MongoDB and Cloudinary.
<p align="center"><img src="READMEIMG/Home.png" width="500" /></p>

<a href = https://divine-axis-370207.ue.r.appspot.com/home /> See the application in action here</a>

### 1. MongoDB database
Install MongoDB

### 2. Key of Cloudinary
Create an .env file copy and paste the following lines inside with clodinary credentials
```
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_KEY=xxxx
CLOUDINARY_SECRET=xxxx
DB_URL=xxxxx
```

## 3. Run the program

Please run:
```shell
cd 547_project
node server.js
```

---
## Major files
[index.js](index.js): All GET and POST <br>
[database.js](database.js): Connect with MongoDB server<br>
[login.ejs](login.ejs): Page to login<br>
[register.ejs](register.ejs): Page to register as a renter/ owner<br>
[profile.ejs](profile.ejs): Users' personal information<br>
[home.ejs](home.ejs): Home Page<br>
[about.ejs](about.ejs): Page of our self-introduction<br>
[product.ejs](product.ejs): Page of listing all availabel cars<br>
[productDetail.ejs](productDetail.ejs): Detail of a specific car<br>
[add.ejs](add.ejs): Page to upload a new car<br>
[routes/users.js](routes/users.js): Route part of login, logout and register<br>
