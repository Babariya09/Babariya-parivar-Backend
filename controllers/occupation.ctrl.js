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

/*--- Add district ---*/

exports.insertOccupation = (req, res) => {
    try {

        const params = req.body;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query("INSERT INTO occupation SET ?", params, (err, rows) => {

                connection.release();

                if (!err) {
                    res.status(201).json({
                        message: "OCCUPATION ADDED",
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

/*--- update occupation ---*/

exports.updateOccupation = (req, res) => {
    try {

        const id = req.params.id;
        const update = {};

        if (req.body.name !== undefined) update.name = req.body.name;

        pool.getConnection((err, connection) => {
            if (err) throw err;


            connection.query("SELECT * FROM occupation WHERE id = ?", id, (err, rows) => {

                if (err) {
                    connection.release();
                    console.log("Database query error:", err);
                    return res.status(200).json({
                        message: "DATABASE QUERY ERROR",
                        status: 200
                    })
                }

                if (rows.length > 0) {
                    connection.query(
                        "UPDATE occupation SET ? WHERE id = ?",
                        [update, id],
                        (err, rows) => {
                            connection.release();

                            if (!err) {
                                res.status(200).json({
                                    message: "OCCUPATION UPDATED SUCCESSFULLY",
                                    status: 200
                                })
                            } else {
                                console.log("Database update error:", err);
                                res.status(500).json({
                                    message: "DATABASE QUERY ERROR",
                                    status: 500
                                })
                            }
                        }
                    )
                } else {
                    connection.release();
                    res.status(404).json({
                        message: "ID NOT FOUND",
                        status: 500
                    })
                }
            })

        })

    } catch (error) {
        console.log("--error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
}



/*--- get All occupation ---*/

exports.getAllOccupation = (req, res) => {
    try {

        pool.getConnection((err, connection) => {

            if (err) throw err;

            connection.query(
                "SELECT * FROM occupation",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "OCCUPATION NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET ALL OCCUPATION SUCCESSFULLY",
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


/*--- delete occupation ---*/

exports.deleteOccupation = (req, res) => {

    try {
        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "DELETE FROM occupation WHERE id = ?",
                [req.params.id],
                (err, rows) => {
                    connection.release();

                    if (!err) {

                        if (rows.affectedRows === 0) {
                            res.status(404).json({
                                message: "OCCUPATION NOT FOUND",
                                status: 404
                            })
                        } else {

                            res.status(200).json({
                                message: "OCCUPATION DELETED SUCCESSFULLY",
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