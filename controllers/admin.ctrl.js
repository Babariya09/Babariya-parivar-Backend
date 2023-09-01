const mysql = require("mysql");
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const status = require("http-status");


/*--- Connection Pool ---*/
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME

})

const saltRounds = 10;

exports.insertAdmin = async (req, res) => {
    try {
        const adminData = req.body;
        console.log("adminData", adminData);


        const confirmPassword = adminData.confirmPassword;
        delete adminData.confirmPassword;


        if (adminData.password !== confirmPassword) {
            return res.status(400).json({
                message: "PASSWORD DO NOT MATCH",
                status: 400
            })
        }

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT COUNT(*) AS totalEmail FROM admin WHERE email = ?",
                [adminData.email],
                async (err, rows) => {
                    connection.release();

                    if (err) {
                        console.log("Database query error:", err);
                        return res.status(500).json({
                            message: "DATABASE QUERY ERROR",
                            status: 500
                        });
                    }

                    const totalEmail = rows[0].totalEmail;
                    if (totalEmail > 0) {
                        return res.status(200).json({
                            totalEmail: totalEmail,
                            message: 'EMAIL ALREADY EXISTS',
                            status: 200
                        });
                    }

                    const password = adminData.password;

                    if (password.length < 6) {
                        return res.status(400).json({
                            message: "PASSWORD LENGTH SHOULD BE AT LEAST 6 CHARACTERS",
                            status: 400
                        });
                    }

                    try {
                        const hashedPassword = await bcrypt.hash(password, saltRounds);
                        adminData.password = hashedPassword;

                        connection.query(
                            "INSERT INTO admin SET ?",
                            adminData,
                            (err, rows) => {
                                if (err) {
                                    console.log("Database insert error:", err);
                                    return res.status(500).json({
                                        message: "DATABASE QUERY ERROR",
                                        status: 500
                                    });
                                }
                                return res.status(201).json({
                                    message: "ADMIN CREATED",
                                    status: 201
                                });
                            }
                        );
                    } catch (error) {
                        console.log("Error while hashing password:", error);
                        return res.status(500).json({
                            message: "PASSWORD HASHING ERROR",
                            status: 500
                        });
                    }
                }
            );
        });
    } catch (error) {
        console.log("---insertAdmin::error---", error);
        return res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
};



const generateAuthtoken = async (userId) => {
    try {
        const secretKey = process.env.SECRET_KEY;
        const token = jwt.sign({ _id: userId.toString() }, secretKey);
        console.log("--generate token--", token);
        return token;
    } catch (error) {
        console.log("error", error);
        throw error;
    }
}

exports.login = (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password.trim();

        console.log("Email:", email);
        console.log("Password:", password);


        pool.getConnection((err, connection) => {
            if (err) {
                console.log("---login::database connection error---", err);
                return res.status(500).json({
                    message: "DATABASE CONNECTION ERROR",
                    status: false,
                    code: 500
                });
            }

            connection.query(
                "SELECT * FROM admin WHERE email = ?",
                [email],
                async (err, rows) => {
                    connection.release();

                    if (err) {
                        console.log("---login::database query error---", err);
                        return res.status(500).json({
                            message: "DATABASE QUERY ERROR",
                            status: false,
                            code: 500
                        });
                    }

                    if (rows.length === 0) {
                        return res.status(404).json({
                            message: "ADMIN NOT FOUND",
                            status: false,
                            code: 404
                        });
                    }

                    const findAdmin = rows[0];

                    if (!findAdmin.password) {
                        console.log("---login::hashed password not found---");
                        return res.status(500).json({
                            message: "HASHED PASSWORD NOT FOUND",
                            status: false,
                            code: 500
                        });
                    }

                    bcrypt.compare(password, findAdmin.password, async (err, comparePassword) => {

                        console.log("comparePassword---------", comparePassword);
                        console.log("password------", password);
                        console.log("findPassword-----", findAdmin.password);

                        if (err) {
                            console.log("Error while comparing passwords:", err);
                            return res.status(500).json({
                                message: "INTERNAL SERVER ERROR",
                                status: false,
                                code: 500
                            });
                        }

                        if (comparePassword) {




                            console.log("Compare Password:", comparePassword);
                            const token = await generateAuthtoken(findAdmin.id);

                            res.cookie("jwt", token, {
                                expires: new Date(Date.now() + 300000 * 3),
                                httpOnly: true
                            });

                            connection.query(
                                "UPDATE admin SET token = ? WHERE id = ?",
                                [token, findAdmin.id],
                                (err, rows) => {
                                    if (err) {
                                        console.log("---login::update token error---", err);
                                        return res.status(500).json({
                                            message: "DATABASE QUERY ERROR",
                                            status: false,
                                            code: 500
                                        });
                                    } else {
                                        return res.status(200).json({
                                            message: "ADMIN LOGIN SUCCESSFULLY",
                                            status: true,
                                            token: token,
                                            code: 200
                                        });
                                    }
                                }
                            );
                        } else {
                            return res.status(401).json({
                                message: "INVALID CREDENTIALS",
                                status: false,
                                code: 401
                            });
                        }
                    });
                }
            );
        });
    } catch (error) {
        console.log("---login::error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: false,
            code: 500
        });
    }
};




exports.changePassword = async (req, res) => {

    try {

        const oldPass = req.body.oldPass;
        const newPass = req.body.newPass;
        const confPass = req.body.confPass;

        const id = req.user.id;
        console.log("--id--", id);

        pool.getConnection((err, connection) => {
            if (err) {

                console.log("---changePassword:error---", err);
                return res.status(500).json({
                    message: "DATABASE CONNECTION ERROR",
                    status: false,
                    code: 500
                })

            }

            connection.query(
                "SELECT * FROM admin WHERE id = ?",
                [id], (err, rows) => {
                    connection.release();

                    if (err) {
                        console.log("---changePassword::Database query error ---", err);
                        return res.status(500).json({
                            message: "DATABASE QUERY ERROR",
                            status: false,
                            code: 500
                        })
                    }

                    if (rows.length === 0) {
                        return res.status(404).json({
                            message: 'ADMIN NOT EXISTS !',
                            status: false,
                            code: 404,
                        });
                    }

                    const adminData = rows[0];

                    bcrypt.compare(oldPass, adminData.password, async (err, comparePassword) => {
                        if (comparePassword) {
                            if (newPass == confPass) {
                                if (newPass.length >= 6) {
                                    const hashedPassword = await bcrypt.hash(newPass, 10);
                                    pool.getConnection((err, connection) => {
                                        if (err) {
                                            console.log('---changePassword:error---', err);
                                            return res.status(500).json({
                                                message: "DATABASE CONNECTION ERROR",
                                                status: false,
                                                code: 500
                                            })
                                        }

                                        connection.query(
                                            "UPDATE admin SET password = ? WHERE id = ?",
                                            [hashedPassword, id],
                                            (err, rows) => {
                                                connection.release();

                                                if (err) {
                                                    console.log("---changePassword:Database update error---", err);
                                                    return res.status(500).json({
                                                        message: "DATABASE UPDATE ERROR",
                                                        status: false,
                                                        code: 500
                                                    })
                                                }
                                                return res.status(200).json({
                                                    message: "YOUR PASSWORD HAS BEEN CHANGED SUCCESSFULLY",
                                                    status: true,
                                                    code: 200
                                                })
                                            }
                                        )
                                    })
                                } else {
                                    res.status(404).json({
                                        message: 'PASSWORD LENGTH MUST BE MORE THAN 6 DIGITS!',
                                        status: false,
                                        code: 404,
                                    })
                                }
                            } else {
                                res.status(404).json({
                                    message: 'NEW PASSWORD AND CONFIRM PASSWORD MUST BE SAME',
                                    status: false,
                                    code: 404,
                                });
                            }
                        } else {
                            res.status(404).json({
                                message: 'OLD PASSWORD DOES NOT MATCH!',
                                status: false,
                                code: 404,
                            });
                        }
                    })
                }
            )
        })

    } catch (error) {
        console.log('---changePassword::error---', error);
        res.status(500).json({
            message: 'SOMETHING WENT WRONG',
            status: false,
            code: 500,
        });
    }

}

exports.updateProfile = (req, res) => {
    try {
        const id = req.params.id;
        const update = {};

        if (req.body.name !== undefined) update.name = req.body.name;
        if (req.body.email !== undefined) update.email = req.body.email;

        pool.getConnection((err, connection) => {
            if (err) {
                console.log("Database connection error:", err);
                return res.status(500).json({
                    message: "DATABASE CONNECTION ERROR",
                    status: 500
                });
            }

            connection.query("SELECT * FROM admin WHERE id = ?", id, (err, rows) => {
                connection.release(); 
                if (err) {
                    console.log("Database query error:", err);
                    return res.status(500).json({
                        message: "DATABASE QUERY ERROR",
                        status: 500
                    });
                }

                if (rows.length > 0) {
                    connection.query("UPDATE admin SET ? WHERE id = ?", [update, id], (err, rows) => {
                        if (err) {
                            console.log("Database update error:", err);
                            return res.status(500).json({
                                message: "DATABASE UPDATE ERROR",
                                status: 500
                            });
                        }

                        res.status(200).json({
                            message: "PROFILE UPDATED SUCCESSFULLY",
                            status: 200
                        });
                    });
                } else {
                    res.status(404).json({
                        message: "ID NOT FOUND",
                        status: 404
                    });
                }
            });
        });

    } catch (error) {
        console.log("---error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
};



