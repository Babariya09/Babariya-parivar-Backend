const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require('cors');
require("dotenv").config();

const PORT = process.env.PORT;

/*--- Parsing Middleware ---*/
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

/*--- Connection Pool ---*/
const pool = mysql.createPool({
    connectionLimit : 100,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USER,
    password        : '',
    database        : process.env.DB_NAME

})

/*--- Connection to DB ---*/
pool.getConnection((err, connection) => {
    if(err) throw err;
    console.log('Connected as ID ' + connection.threadId);
})


/* --- main Member Router --- */
const mainRoute = require("./routes/mainMember.route");
app.use('/mainMember', mainRoute);

/* --- Sub Member Router --- */
const memberRoute = require("./routes/subMember.route");
app.use("/subMember" , memberRoute);

/* --- Student Result Router --- */
const resultRoute = require("./routes/result.route");
app.use("/result" , resultRoute);

/* --- Taluka Router --- */
const talukaRoute = require("./routes/taluka.route");
app.use("/taluka" , talukaRoute);

/*--- village Router ---*/
const villageRoute = require("./routes/village.route");
app.use("/village" , villageRoute);

/*--- district Router ---*/
const districtRoute = require("./routes/district.route");
app.use("/district" , districtRoute);

/*--- occupation Router ---*/
const occupationRoute = require("./routes/occupation.route");
app.use("/occupation" , occupationRoute);

/*--- education Router ---*/
const educationRoute = require("./routes/education.route");
app.use("/education" , educationRoute);

/*--- relation Router ---*/
const relationRoute = require("./routes/relation.route");
app.use("/relation" , relationRoute);

/*--- bloodGroup Router ---*/
const bGRoute = require("./routes/bloodGroup.route");
app.use("/bg", bGRoute);

/*--- donation router ---*/
const donationRoute =  require("./routes/donation.route");
app.use("/donation" , donationRoute);

/*--- admin route ---*/
const adminRoute = require("./routes/admin.route");
app.use("/admin" , adminRoute);


app.listen(PORT, ()=> {
    console.log(`server running successfully on port ${PORT}`);
});