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

/*--- Add donation ---*/

exports.insertDonation = (req, res) => {
    try {

        const donationData = req.body;
        const mainMemberId = req.params.mainMemberId;

        if (!mainMemberId) {
            return res.status(status.BAD_REQUEST).json({
                message: "Main member ID is required to create a sub-member.",
                status: 400
            })
        }

        if (donationData.donation_name !== 0 && donationData.donation_name !== 1) {
            return res.status(status.BAD_REQUEST).json({
                message: "Invalid value for donation name. It should be either 0 or 1.",
                status: 400
            });
        }
        if (donationData.donation_fees !== 0 && donationData.donation_fees !== 1) {
            return res.status(status.BAD_REQUEST).json({
                message: "Invalid value for donation fees. It should be either 0 or 1.",
                status: 400
            });
        }

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM mainmember WHERE id = ?",
                [mainMemberId],
                (err, mainMemberRows) => {
                    if (err) {
                        connection.release();
                        console.log("Database query error:", err);
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            message: "DATABASE QUERY ERROR",
                            status: 500
                        })
                    }

                    if (mainMemberRows.length === 0) {
                        connection.release();
                        return res.status(status.NOT_FOUND).json({
                            message: "MAIN MEMBER NOT FOUND",
                            status: 404
                        });
                    }

                    donationData.member_id = mainMemberId;

                    connection.query("INSERT INTO donation SET ?", donationData, (err, donationRows) => {
                        connection.release();

                        if (!err) {
                            res.status(201).json({
                                message: "DONATION ADDED",
                                status: 201
                            })
                        } else {
                            console.log("Database first error: ", err);
                            res.status(status.INTERNAL_SERVER_ERROR).json({
                                message: "DATABASE QUERY ERROR",
                                status: 500
                            });
                        }
                    })

                }
            )

        })


    } catch (error) {
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
}



/*--- update bloodgroup ---*/
exports.updateDonation =  (req, res) => {
    try {
        const id = req.params.id;
        const update = {};


        if (req.body.member_id !== undefined) {

            pool.getConnection((err, connection) => {
                if (err) {
                    console.log("Database connection error:", err);
                    return res.status(status.INTERNAL_SERVER_ERROR).json({
                        message: "DATABASE CONNECTION ERROR",
                        status: 500
                    });
                }

                connection.query(
                    "SELECT id FROM mainmember WHERE id = ?",
                    [req.body.member_id],
                    (err, rows) => {
                        if (err) {
                            connection.release();
                            console.log("Database query error:", err);
                            return res.status(status.INTERNAL_SERVER_ERROR).json({
                                message: "DATABASE SERVER ERROR",
                                status: 500
                            });
                        }

                        if (rows.length === 0) {
                            connection.release();
                            return res.status(status.BAD_REQUEST).json({
                                message: "Main member ID does not exist",
                                status: 400
                            })
                        }

                        update.member_id = req.body.member_id;

                        connection.query(
                            "UPDATE donation SET ? WHERE id = ?",
                            [update, id],
                            (err, rows) => {
                                connection.release();

                                if (!err) {
                                    res.status(200).json({
                                        message: "DONATION UPDATED SUCCESSFULLY",
                                        status: 200
                                    });
                                } else {
                                    console.error("Database update error:", err);
                                    res.status(status.INTERNAL_SERVER_ERROR).json({
                                        message: "DATABASE UPDATE ERROR",
                                        status: 500
                                    });
                                }
                            }
                        );
                    }
                )

            })
        }
        else {
            if (req.body.donation_name !== undefined) update.donation_name = req.body.donation_name;
            if (req.body.donation_fees !== undefined) update.donation_fees = req.body.donation_fees;
            if (req.body.member_id !== undefined) update.member_id = req.body.member_id;

            pool.getConnection((err, connection) => {
                if (err) throw err;

                connection.query("SELECT * FROM bloodGroup WHERE id = ?", id, (err, rows) => {
                    if (err) {
                        connection.release();
                        console.log("Database query error:", err);
                        return res.status(500).json({
                            message: "DATABASE QUERY ERROR",
                            status: 500
                        });
                    }
 
                    if (rows.length > 0) {
                        connection.query("UPDATE bloodGroup SET ? WHERE id = ?", [update, id], (err, result) => {
                            connection.release();
                            if (!err) {
                                res.status(200).json({
                                    message: "BLOODGROUP UPDATED SUCCESSFULLY",
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
        }

    } catch (error) {
        console.log("---error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
};




/*--- get All bloodgroup ---*/

exports.viewAllDonation = (req, res) => {
    try {

        pool.getConnection((err, connection) => {

            if (err) throw err;

            connection.query(
                "SELECT * FROM donation",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "DONATION NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET ALL DONATION SUCCESSFULLY",
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


/*--- delete bloodgroup ---*/

exports.deleteDonation = (req, res) => {

    try {
        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "DELETE FROM donation WHERE id = ?",
                [req.params.id],
                (err, rows) => {
                    connection.release();

                    if (!err) {

                        if (rows.affectedRows === 0) {
                            res.status(404).json({
                                message: "DONATION NOT FOUND",
                                status: 404
                            })
                        } else {

                            res.status(200).json({
                                message: "DONATION DELETED SUCCESSFULLY",
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



/*--- view Donation By MemberId ---*/

exports.viewDonationByMemberId = (req, res) => {
    try {

        pool.getConnection((err, connection) => {

            if (err) throw err;

            connection.query(
                "SELECT * FROM donation WHERE member_id = ?",[req.params.member_id],
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "DONATION NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET ALL DONATION SUCCESSFULLY",
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