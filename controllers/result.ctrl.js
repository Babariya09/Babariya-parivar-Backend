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

/*--- Add student result ---*/

exports.insertResult = (req, res) => {
    try {

        const resultdata = req.body;
        const mainMemberId = req.params.mainMemberId;
        const subMemberId = req.params.subMemberId;

        if (!mainMemberId) {
            return res.status(status.BAD_REQUEST).json({
                message: "Main member ID is required to add  student result.",
                status: 400
            })
        } else if (!subMemberId) {
            return res.status(status.BAD_REQUEST).json({
                message: "Sub member ID is required to add  student result.",
                status: 400
            })
        }

        if (resultdata.book !== 0 && resultdata.book !== 1) {
            return res.status(400).json({
                message: "Invalid value for book. It should be either 0 or 1.",
                status: 400
            })
        }

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM mainmember WHERE id = ?",
                [mainMemberId],
                (err, mainMemberRows) => {
                    if (err) {
                        connection.release();
                        console.error("Database query error:", err);
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            message: "DATABASE QUERY ERROR",
                            status: 500
                        });
                    } else if (mainMemberRows.length === 0) {
                        connection.release();
                        return res.status(status.NOT_FOUND).json({
                            message: "MAIN MEMBER NOT FOUND",
                            status: 404
                        });
                    }

                    resultdata.member_id = mainMemberId
                    connection.query(
                        "SELECT * FROM submember WHERE id = ?",
                        [subMemberId],
                        (err, subMemberRows) => {
                            if (err) {
                                connection.release();
                                console.error("Database query error:", err);
                                return res.status(status.INTERNAL_SERVER_ERROR).json({
                                    message: "DATABASE QUERY ERROR",
                                    status: 500
                                });
                            } else if (subMemberRows.length === 0) {
                                connection.release();
                                return res.status(status.NOT_FOUND).json({
                                    message: "SUB MEMBER NOT FOUND",
                                    status: 404
                                });
                            }

                            resultdata.sub_member_id = subMemberId

                            connection.query("INSERT INTO result SET ?",
                                resultdata,
                                (err, resultdata) => {
                                    connection.release();

                                    if (!err) {
                                        res.status(201).json({
                                            message: "STUDENT RESULT INSERTED",
                                            status: 201
                                        })
                                    } else {
                                        console.log("database insert error:", err);
                                        res.status(status.INTERNAL_SERVER_ERROR).json({
                                            message: "DATABASE QUERY ERROR",
                                            status: 500
                                        })
                                    }
                                })
                        }
                    )
                }
            )
        })

    } catch (error) {
        console.log("---error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
}



/*--- Add student result ---*/

exports.updateResult = (req, res) => {
    try {
        const id = req.params.id;
        const updateFields = {};

        if (req.body.sub_member_id !== undefined) {

            updateFields.sub_member_id = req.body.sub_member_id;
        }
        if (req.body.member_id !== undefined) {
            updateFields.member_id = req.body.member_id;
        }


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
                    (err, mainMemberRows) => {
                        connection.release();
                        if (err) {
                            console.log("Database query error:", err);
                            return res.status(status.INTERNAL_SERVER_ERROR).json({
                                message: "DATABASE SERVER ERROR",
                                status: 500
                            });
                        }
                        if (mainMemberRows.length === 0) {
                            return res.status(status.BAD_REQUEST).json({
                                message: "Main member ID does not exist",
                                status: 400
                            });
                        }

                        updateFields.member_id = req.body.member_id;

                        if (
                            req.body.member_id !== undefined &&
                            req.body.sub_member_id !== undefined
                        ) {
                            updateSubMember();
                        } else {

                            updateOtherFields();
                        }
                    }
                );
            });
        } else {

            if (req.body.sub_member_id !== undefined) {
                pool.getConnection((err, connection) => {
                    if (err) {
                        console.log("Database connection error:", err);
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            message: "DATABASE CONNECTION ERROR",
                            status: 500
                        });
                    }

                    connection.query(
                        "SELECT id FROM submember WHERE id = ?",
                        [req.body.sub_member_id],
                        (err, subMemberRows) => {
                            connection.release();
                            if (err) {
                                console.log("Database query error:", err);
                                return res.status(status.INTERNAL_SERVER_ERROR).json({
                                    message: "DATABASE SERVER ERROR",
                                    status: 500
                                });
                            }
                            if (subMemberRows.length === 0) {
                                return res.status(status.BAD_REQUEST).json({
                                    message: "Sub member ID does not exist",
                                    status: 400
                                });
                            }

                            updateFields.sub_member_id = req.body.sub_member_id;
                            // Update the other fields
                            updateOtherFields();
                        }
                    );
                });
            } else {

                updateOtherFields();
            }
        }


        function updateOtherFields() {

            if (req.body.sub_member_id !== undefined) updateFields.sub_member_id = req.body.sub_member_id;
            if (req.body.member_id !== undefined) updateFields.member_id = req.body.member_id;
            if (req.body.name !== undefined) updateFields.name = req.body.name;
            if (req.body.address !== undefined) updateFields.address = req.body.address;
            if (req.body.mobile_number !== undefined) updateFields.mobile_number = req.body.mobile_number;
            if (req.body.standard !== undefined) updateFields.standard = req.body.standard;
            if (req.body.year !== undefined) updateFields.year = req.body.year;
            if (req.body.total_marks !== undefined) updateFields.total_marks = req.body.total_marks;
            if (req.body.obtained_marks !== undefined) updateFields.obtained_marks = req.body.obtained_marks;
            if (req.body.percentage !== undefined) updateFields.percentage = req.body.percentage;
            if (req.body.book !== undefined) updateFields.book = req.body.book;
            if (req.body.total_book !== undefined) updateFields.total_book = req.body.total_book;


            pool.getConnection((err, connection) => {
                if (err) throw err;

                connection.query("SELECT * FROM result WHERE id = ?", id, (err, rows) => {
                    if (err) {
                        connection.release();
                        console.log("Database query error:", err);
                        return res.status(500).json({
                            message: "DATABASE QUERY ERROR",
                            status: 500
                        });
                    }

                    if (rows.length > 0) {
                        connection.query("UPDATE result SET ? WHERE id = ?", [updateFields, id], (err, result) => {
                            connection.release();
                            if (!err) {
                                res.status(200).json({
                                    message: "STUDENT RESULT UPDATED SUCCESSFULLY",
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


        function updateSubMember() {
            pool.getConnection((err, connection) => {
                if (err) throw err;

                connection.query(
                    "SELECT id FROM submember WHERE id = ?",
                    [req.body.sub_member_id],
                    (err, subMemberRows) => {
                        connection.release();
                        if (err) {
                            console.log("Database query error:", err);
                            return res.status(status.INTERNAL_SERVER_ERROR).json({
                                message: "DATABASE SERVER ERROR",
                                status: 500
                            });
                        }
                        if (subMemberRows.length === 0) {
                            return res.status(status.BAD_REQUEST).json({
                                message: "Sub member ID does not exist",
                                status: 400
                            });
                        }

                        pool.getConnection((err, connection) => {
                            if (err) throw err;

                            connection.query(
                                "UPDATE result SET ? WHERE id = ?",
                                [updateFields, id],
                                (err, rows) => {
                                    connection.release();

                                    if (!err) {
                                        res.status(200).json({
                                            message: "STUDENT RESULT UPDATES SUCCESSFULLY",
                                            status: 200
                                        });
                                    } else {
                                        console.log("Database update error:", err);
                                        res.status(status.INTERNAL_SERVER_ERROR).json({
                                            message: "DATABASE QUERY ERROR",
                                            status: 500
                                        });
                                    }
                                }
                            );
                        });
                    }
                );
            });
        }
    } catch (error) {
        console.log("---error---", error);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
};


/*--- Get Student Result ---*/

exports.viewResultById = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM result WHERE id = ?", [req.params.id],
                (err, rows) => {
                    connection.release();
                    if (!err) {
                        if (rows.length == 0) {
                            return res.status(404).json({
                                message: "STUDENT RESULT NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET STUDENT RESULT SUCCESSFULLY",
                                status: 200,
                                data: rows
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
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
}

/*--- view all student result ---*/

exports.viewAllResult = async (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT *  FROM result",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "STUDENT RESULT NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET ALL STUDENT RESULT",
                                status: 200,
                                data: rows
                            });
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

/* --- Delete Users --- */

exports.deleteResult = (req, res) => {
    try {
        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "DELETE FROM result WHERE id = ?",
                [req.params.id],
                (err, rows) => {

                    connection.release();

                    if (!err) {
                        if (rows.affectedRows === 0) {
                            res.status(404).json({
                                message: "ID NOT FOUND"
                            })
                        }
                        else {
                            res.status(200).json({
                                message: "STUDENT RESULT DELETED SUCCESSFULLY",
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

/*--- renker student list ---*/

exports.renkerStudent = (req, res) => {
    try {
        const year = req.body.year;
        const standard = req.body.standard;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            let sqlQuery;
            let queryParams;

            if (year && standard) {
                sqlQuery = "SELECT * FROM result WHERE year = ? AND standard = ? ORDER BY percentage DESC LIMIT 3";
                queryParams = [year, standard];
            }

            connection.query(sqlQuery, queryParams, (err, rows) => {
                connection.release();

                if (!err) {
                    if (rows.length == 0) {
                        return res.status(404).json({
                            message: "RENKER STUDENTS NOT FOUND",
                            status: 404
                        });
                    } else {
                        res.status(200).json({
                            message: "GET RENKER STUDENT SUCCESSFULLY",
                            status: 200,
                            data: rows
                        })
                    }

                } else {
                    console.log("Database query error");
                    res.status(500).json({
                        message: "DATABASE QUERY ERROR",
                        status: 500
                    })
                }
            })
        })

    } catch (error) {
        console.log("---error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
}


/*--- view Result By Main MemberId ---*/
exports.viewResultByMainMemberId = (req, res) => {
    try {
        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM result WHERE member_id = ?", [req.params.member_id],
                (err, rows) => {
                    connection.release();
                    if (!err) {
                        if (rows.length == 0) {
                            return res.status(404).json({
                                message: "STUDENT RESULT NOT FOUND",
                                status: 404
                            });
                        } else {
                            res.status(200).json({
                                message: "GET STUDENT RESULT SUCCESSFULLY",
                                status: 200,
                                data: rows
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


/*--- view Result By SubMemberId ---*/

exports.viewResultBySubMemberId = (req, res) => {
    try {
        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM result WHERE sub_member_id = ?", [req.params.sub_member_id],
                (err, rows) => {
                    connection.release();
                    if (!err) {
                        if (rows.length == 0) {
                            return res.status(404).json({
                                message: "STUDENT RESULT NOT FOUND",
                                status: 404
                            });
                        } else {
                            res.status(200).json({
                                message: "GET STUDENT RESULT SUCCESSFULLY",
                                status: 200,
                                data: rows
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