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

/*--- sub member ---*/

exports.insertSubMember = (req, res) => {
    try {
        const subMemberData = req.body;
        const mainMemberId = req.params.mainMemberId;

        if (!mainMemberId) {
            return res.status(status.BAD_REQUEST).json({
                message: "Main member ID is required to create a sub-member.",
                status: 400
            });
        }

        if (subMemberData.sex !== 0 && subMemberData.sex !== 1) {
            return res.status(status.BAD_REQUEST).json({
                message: "Invalid value for sex. It should be either 0 or 1.",
                status: 400
            });
        }
        if (subMemberData.marital_status !== 0 && subMemberData.marital_status !== 1) {
            return res.status(status.BAD_REQUEST).json({
                message: "Invalid value for marital status. It should be either 0 or 1.",
                status: 400
            });
        }

        if (subMemberData.blood_group) {
            subMemberData.blood_group = subMemberData.blood_group.toUpperCase();
        }

        function capitalizeFirstLetter(str) {
            return str.toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase());
        }

        if (subMemberData.occupation && subMemberData.education && subMemberData.relation) {
            subMemberData.occupation = capitalizeFirstLetter(subMemberData.occupation);
            subMemberData.education = capitalizeFirstLetter(subMemberData.education);
            subMemberData.relation = capitalizeFirstLetter(subMemberData.relation);
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
                        });
                    }

                    if (mainMemberRows.length === 0) {
                        connection.release();
                        return res.status(status.NOT_FOUND).json({
                            message: "MAIN MEMBER NOT FOUND",
                            status: 404
                        });
                    }


                    subMemberData.member_id = mainMemberId;


                    connection.query("INSERT INTO submember SET ?", subMemberData, (err, subMemberRows) => {
                        connection.release();

                        if (!err) {
                            res.status(201).json({
                                message: "SUB MEMBER CREATED",
                                status: 201
                            });
                        } else {
                            console.log("Database insert error:", err);
                            res.status(status.INTERNAL_SERVER_ERROR).json({
                                message: "DATABASE QUERY ERROR",
                                status: 500
                            });
                        }
                    });
                }
            );
        });
    } catch (error) {
        console.log("----error----", error);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
};


/*---End sub member ---*/

/*--- Update main member ---*/

exports.updateSubMember = (req, res) => {
    try {

        const id = req.params.id;
        const updateFields = {};

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

                        updateFields.member_id = req.body.member_id;

                        connection.query(
                            "UPDATE submember SET ? WHERE id = ?",
                            [updateFields, id],
                            (err, rows) => {
                                connection.release();

                                if (!err) {
                                    res.status(200).json({
                                        message: "SUB MEMBER UPDATED SUCCESSFULLY",
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

        } else {

            if (req.body.member_id !== undefined) updateFields.member_id = req.body.member_id;
            if (req.body.name !== undefined) updateFields.name = req.body.name;
            if (req.body.mobile_number !== undefined) updateFields.mobile_number = req.body.mobile_number;
            if (req.body.age !== undefined) updateFields.age = req.body.age;
            if (req.body.sex !== undefined) updateFields.sex = req.body.sex;
            if (req.body.marital_status !== undefined) updateFields.marital_status = req.body.marital_status;
            if (req.body.blood_group !== undefined) updateFields.blood_group = req.body.blood_group;
            if (req.body.occupation !== undefined) updateFields.occupation = req.body.occupation;
            if (req.body.education !== undefined) updateFields.education = req.body.education;
            if (req.body.relation !== undefined) updateFields.relation = req.body.relation;

            pool.getConnection((err, connection) => {
                if (err) throw err;

                connection.query("SELECT * FROM submember WHERE id = ?", id, (err, rows) => {
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
                            "UPDATE submember SET ? WHERE id = ?",
                            [updateFields, id],
                            (err, rows) => {
                                connection.release();

                                if (!err) {
                                    res.status(200).json({
                                        message: "SUB MEMBER UPDATED SUCCESSFULLY",
                                        status: 200
                                    });
                                } else {
                                    console.log("Database update error:", err);
                                    res.status(500).json({
                                        message: "DATABASE QUERY ERROR",
                                        status: 500
                                    });
                                }
                            }
                        );
                    } else {
                        connection.release();
                        res.status(404).json({
                            message: "ID NOT FOUND",
                            status: 500
                        })
                    }

                })


            });
        }

    } catch (error) {
        console.log("---error---", error);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
}

/*--- End Update main member ---*/


/*--- Get Main Member ---*/

exports.viewSubMemberById = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM submember WHERE id = ?", [req.params.id],
                (err, rows) => {
                    connection.release();
                    if (!err) {
                        if (rows.length == 0) {
                            return res.status(404).json({
                                message: "SUBMEMBER NOT FOUND",
                                status: 404
                            });
                        } else {
                            res.status(200).json({
                                message: "GET SUB MEMBER PROFILE SUCCESSFULLY",
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
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
}


/*--- End Get Main Member ---*/

/*--- view all sub members ---*/

exports.viewAllsubMember = async (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err; !


                connection.query(
                    "SELECT * FROM submember",
                    (err, rows) => {

                        connection.release();

                        if (!err) {
                            if (rows.length === 0) {
                                return res.status(404).json({
                                    message: "SUB MEMBER NOT FOUND",
                                    status: 404
                                });
                            } else {
                                res.status(200).json({
                                    message: "GET ALL SUB MEMBERS",
                                    status: 200,
                                    data: rows
                                });
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
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
};

/*--- End view all main members ---*/



/* ----- Delete Users ----- */
exports.deleteSubMember = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;


        connection.query(
            "DELETE FROM submember WHERE id = ?",
            [req.params.id],
            (err, rows) => {

                connection.release();

                if (!err) {

                    if (rows.affectedRows === 0) {

                        res.status(404).json({
                            message: "ID NOT FOUND",
                            status: 404
                        })
                    }
                    else {

                        res.status(200).json({
                            message: "SUB MEMBER DELETED SUCCESSFULLY",
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
};


/*--- total sub members ---*/

exports.totalSubMember = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT COUNT(*) AS totalMembers FROM submember",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        const totalMembers = rows[0].totalMembers;
                        res.status(200).json({
                            totalMembers: totalMembers,
                            message: "Total Sub Members counted successfully",
                            status: 200,
                            data: rows
                        })
                    } else {
                        console.log("Database query error:", err);
                        res.status(500).json({
                            message: "DATABASE QUERY ERROR",
                            status: 500
                        })
                    }
                }
            )
        })

    } catch (error) {
        console.log("--error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
}


/*--- viewSubMemberByMainMemberId ---*/

exports.viewSubMemberByMainMemberId = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM submember WHERE member_id = ?", [req.params.member_id],
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length == 0) {
                            return res.status(404).json({
                                message: "MAINMEMBER NOT FOUND",
                                status: 404
                            });
                        } else {
                            res.status(200).json({
                                message: "GET SUB MEMBER PROFILE SUCCESSFULLY",
                                status: 200,
                                data: rows
                            })
                        }
                    } else {
                        console.log("Database query error:", err);
                        res.status(500).json({
                            message: "DATABASE QUERY ERROR",
                            status: 500
                        })
                    }
                }
            )
        })

    } catch (error) {
        console.log("--error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
}