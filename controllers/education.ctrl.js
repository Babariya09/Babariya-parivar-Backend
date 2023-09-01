const mysql = require("mysql");
require('dotenv').config();

const status = require("http-status");

/*--- Connection Pool---*/
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME

})

/*--- Add education ---*/

exports.insertEducation = (req, res) => {
    try {

        const params = req.body;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query("INSERT INTO education SET ?", params, (err, rows) => {

                connection.release();

                if (!err) {
                    res.status(201).json({
                        message: "EDUCATION ADDED",
                        status: 201
                    })
                } else {
                    console.log("Database insert error:", err);
                    res.status(status.INTERNAL_SERVER_ERROR).json({
                        message: "DATABASE QUERY ERROR",
                        status: 500
                    })
                }

            })
        })

    } catch (error) {
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
}

/*--- update education ---*/
exports.updateEducation = (req, res) => {
    try {
        const id = req.params.id;
        const update = {};

        if (req.body.name !== undefined) update.name = req.body.name;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query("SELECT * FROM education WHERE id = ?", id, (err, rows) => {
                if (err) {
                    connection.release();
                    console.log("Database query error:", err);
                    return res.status(500).json({
                        message: "DATABASE QUERY ERROR",
                        status: 500
                    });
                }

                if (rows.length > 0) {
                    connection.query("UPDATE education SET ? WHERE id = ?", [update, id], (err, result) => {
                        connection.release();
                        if (!err) {
                            res.status(200).json({
                                message: "EDUCATION UPDATED SUCCESSFULLY",
                                status: 200
                            });
                        } else {
                            console.log("Database update error:", err);
                            res.status(500).json({
                                message: "DATABASE UPDATE ERROR",
                                status: 500
                            });
                        }
                    });
                } else {
                    connection.release();
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




/*--- get All education ---*/

exports.viewAllEducation = (req, res) => {
    try {

        pool.getConnection((err, connection) => {

            if (err) throw err;

            connection.query(
                "SELECT * FROM education",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "EDUCATION NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET ALL EDUCATION SUCCESSFULLY",
                                status: 200,
                                data: rows
                            })
                        }
                    }
                }
            )

        })

    } catch (error) {
        console.log("---error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
}


/*--- delete education ---*/

exports.deleteEducation = (req, res) => {

    try {
        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "DELETE FROM education WHERE id = ?",
                [req.params.id],
                (err, rows) => {
                    connection.release();

                    if (!err) {

                        if (rows.affectedRows === 0) {
                            res.status(404).json({
                                message: "EDUCATION NOT FOUND",
                                status: 404
                            })
                        } else {

                            res.status(200).json({
                                message: "EDUCATION DELETED SUCCESSFULLY",
                                status: 200
                            })

                        }

                    } else {
                        res.status(500).json({
                            message: "DATABASE QUERY ERROR",
                            status: 500
                        })
                    }
                }
            )
        })
    } catch (error) {
        console.log("---error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }

}