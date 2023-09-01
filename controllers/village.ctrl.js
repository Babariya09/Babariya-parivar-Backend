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

/*--- Add village ---*/

exports.insertVillage = (req, res) => {
    try {

        const params = req.body;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query("INSERT INTO village SET ?", params, (err, rows) => {

                connection.release();

                if (!err) {
                    res.status(201).json({
                        message: "VILLAGE ADDED",
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

/*--- update village ---*/

exports.updateVillage = (req, res) => {
    try {
        
        const id = req.params.id;
        const update = {};

        if(req.body.name !== undefined) update.name = req.body.name;

        pool.getConnection((err, connection) => {
            if(err) throw err;

            connection.query("SELECT * FROM village WHERE id = ?", id, (err, rows) => {
                if(err) {
                    connection.release();
                    console.log("Database query error:" , err);
                    return res.status(500).json({
                        message: "DATABASE QUERY ERROR",
                        status: 500
                    })
                }

                if(rows.length > 0) {
                    connection.query("UPDATE village SET ? WHERE id = ?", [update, id], (err, result) => {
                        connection.release();
                        if(!err) {
                            res.status(200).json({
                                message: "VILLAGE UPDATED SUCCESSFULLY",
                                status: 200
                            })
                        } else {
                            console.log("Database update error:", err);
                            res.status(500).json({
                                message: "DATABASE UPDATE ERROR",
                                status: 500
                            });
                        }
                    })
                }else {
                    connection.release();
                    res.status(404).json({
                        message: "ID NOT FOUND",
                        status: 404
                    });
                }
            })
        })

    } catch (error) {
        console.log("---error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
}

/*--- get one village ---*/

exports.getVillage = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM village WHERE id = ?", [req.params.id],
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "VILLAGE NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET VILLAGE SUCCESSFULLY",
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


/*--- get All Village ---*/

exports.viewAllVillage = (req, res) => {
    try {

        pool.getConnection((err, connection) => {

            if (err) throw err;

            connection.query(
                "SELECT * FROM village",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "VILLAGE NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET ALL VILAGE SUCCESSFULLY",
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


/*--- delete village ---*/

exports.deleteVillage = (req, res) => {

    try {
        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "DELETE FROM village WHERE id = ?",
                [req.params.id],
                (err, rows) => {
                    connection.release();

                    if (!err) {

                        if(rows.affectedRows === 0) {
                            res.status(404).json({
                                message: "VILLAGE NOT FOUND",
                                status: 404
                            })
                        }else{
                            
                        res.status(200).json({
                            message: "VILLAGE DELETED SUCCESSFULLY",
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