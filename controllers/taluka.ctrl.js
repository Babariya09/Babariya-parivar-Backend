const mysql = require("mysql");
require('dotenv').config();

const status = require("http-status");


/*--- Connection Pool ---*/
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME

})

/*--- Add taluka ---*/

exports.insertTaluka = (req, res) => {
    try {

        const params = req.body;

        function capitalizeFirstLetter(str) {
            return str.toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase());
        }

        if (params.name) {
            params.name = capitalizeFirstLetter(params.name);
        }

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query("INSERT INTO taluka SET ?", params, (err, rows) => {

                connection.release();
                if (!err) {
                    res.status(201).json({
                        message: " TALUKA ADDED",
                        status: 201
                    })
                } else {
                    res.status(500).json({
                        message: "DATABASE QUERY ERROR",
                        status: 500
                    })
                }
            })
        })

    } catch (error) {

        console.log("----error----", error);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });

    }
}


/*--- Update taluka ---*/

exports.updateTaluka = (req,res) => {
    try {
        
        const id = req.params.id;
        const update = {};

        if(req.body.name !== undefined) update.name = req.body.name;

        pool.getConnection((err, connection) => {
            if(err) throw err;

            connection.query("SELECT * FROM taluka WHERE id = ?", id, (err, rows) => {
                if(err) {
                    connection.release();
                    console.log("Database query error:" , err);
                    return res.status(500).json({
                        message: "DATABASE QUERY ERROR",
                        status: 500
                    })
                }

                if(rows.length > 0) {
                    connection.query("UPDATE taluka SET ? WHERE id = ?", [update, id], (err, result) => {
                        connection.release();
                        if(!err) {
                            res.status(200).json({
                                message: "TALUKA UPDATED SUCCESSFULLY",
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


/*--- get taluka ---*/

exports.getTaluka = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM taluka WHERE id = ?", [req.params.id],
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "TALUKA NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET TALUKA SUCCESSFULLY",
                                status: 200,
                                data: rows
                            })
                        }
                    } else {
                        console.log("--err--", err);
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

/*--- get all taluka ---*/
exports.getAllTaluka = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM taluka",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "TALUKA NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET ALL TALUKA SUCCESSFULLY",
                                status: 200,
                                data: rows
                            })
                        }
                    } else {
                        console.log("--err--", err);
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

/* ----- Delete taluka ----- */
exports.deleteTaluka = (req, res) => {

    try {
        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "DELETE FROM taluka WHERE id = ?",
                [req.params.id],
                (err, rows) => {

                    connection.release();

                    if (!err) {

                        if(rows.affectedRows === 0) {
                            res.status(404).json({
                                message: "TALUKA NOT FOUND",
                                status: 404
                            })
                        }else{
                            
                        res.status(200).json({
                            message: "TALUKA DELETED SUCCESSFULLY",
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
            );
        });
    } catch (error) {
        console.log("---error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }

};

/* -----End Delete taluka ----- */