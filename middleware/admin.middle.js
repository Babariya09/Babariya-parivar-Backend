const mysql = require("mysql");
const status = require("http-status");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME
})

exports.verifyAdmin = (req, res, next) => {

    const Token = req.headers['authorization'];
    console.log("TOKEN------------------" , Token);


    if (Token) {

        try {

            const decoded = jwt.verify(Token, process.env.SECRET_KEY);
            console.log("token----" , decoded);

            pool.getConnection((err, connection) => {
                if (err) {
                    console.log("Error connecting to the database: ", err);
                    return res.status(status.INTERNAL_SERVER_ERROR).json({
                        message: "INTERNAL SERVER ERROR",
                        status: false,
                        code: status.INTERNAL_SERVER_ERROR
                    })
                }

                const query = `SELECT * FROM admin WHERE id = ? `;

                connection.query(query, [decoded._id], (err, rows) => {
                    connection.release();

                    if (err) {
                        console.error("Error executing query:", err);
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            message: "Internal Server Error",
                            status: false,
                            code: status.INTERNAL_SERVER_ERROR
                        })
                    }

                    if (rows.length > 0) {
                        const data = rows[0];

                        if (Token == data.token) {
                            req.user = data;
                            next();
                        } else {
                            res.status(status.UNAUTHORIZED).json({
                                message: "UNAUTHORIZED!",
                                status: false,
                                code: status.UNAUTHORIZED
                            })
                        }
                    } else {
                        res.status(status.NOT_FOUND).json({
                            message: "ADMIN NOT FOUND!",
                            status: false,
                            code: status.NOT_FOUND,
                        });
                    }
                })

            })

        } catch (error) {
            res.status(status.UNAUTHORIZED).json({
                message: "INVALID TOKEN!",
                status: false,
                code: status.UNAUTHORIZED,
            });
        }

    } else {
        res.status(status.FORBIDDEN).json({
            message: "TOKEN NOT PROVIDED!",
            status: false,
            code: status.FORBIDDEN,
        });
    }

}