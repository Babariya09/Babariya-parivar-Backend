const mysql = require("mysql");
require('dotenv').config();

/*--- Connection Pool ---*/
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME

})

/*--- Add main member ---*/

exports.insertMember = (req, res) => {
    try {
        const params = req.body;

        if (params.sex !== 0 && params.sex !== 1 && params.sex !== 2) {
            return res.status(400).json({
                message: "Invalid value for sex. It should be either 0 ,1 or 2 .",
                status: 400
            });
        }
        if (params.marital_status !== 0 && params.marital_status !== 1) {
            return res.status(400).json({
                message: "Invalid value for marital status. It should be either 0 or 1.",
                status: 400
            });
        }
        if (params.commitee !== 0 && params.commitee !== 1) {
            return res.status(400).json({
                message: "Invalid value for commitee. It should be either 0 or 1.",
                status: 400
            });
        }


        function capitalizeFirstLetter(str) {
            return str.toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase());
        }

        if (params.blood_group) {
            params.blood_group = params.blood_group.toUpperCase();
        }
        if (params.occupation && params.education && params.village && params.taluko && params.district) {
            params.occupation = capitalizeFirstLetter(params.occupation);
            params.education = capitalizeFirstLetter(params.education);
            params.village = capitalizeFirstLetter(params.village);
            params.taluko = capitalizeFirstLetter(params.taluko);
            params.district = capitalizeFirstLetter(params.district);
        }

        if (params.is_register !== 0 && params.is_register !== 1) {
            return res.status(400).json({
                message: "Invalid value for is_register. It should be either 0 or 1.",
                status: 400
            });
        }


        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query("INSERT INTO mainmember SET ?", params, (err, rows) => {

                connection.release();

                if (!err) {
                    res.status(201).json({
                        message: "MAIN MEMBER CREATED",
                        status: 201
                    });
                } else {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({
                            message: "Mobile number must be unique and should not repeat.",
                            status: 400
                        })
                    } else {
                        res.status(500).json({
                            message: "DATABASE QUERY ERROR",
                            status: 500
                        });
                    }
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

/*--- End Add main member ---*/


/*--- Update main member ---*/

exports.updateMember = (req, res) => {
    try {
        const id = req.params.id;
        const updateFields = {};

        if (req.body.name !== undefined) updateFields.name = req.body.name;
        if (req.body.address !== undefined) updateFields.address = req.body.address;
        if (req.body.age !== undefined) updateFields.age = req.body.age;
        if (req.body.sex !== undefined) updateFields.sex = req.body.sex;
        if (req.body.marital_status !== undefined) updateFields.marital_status = req.body.marital_status;
        if (req.body.mobile_number !== undefined) updateFields.mobile_number = req.body.mobile_number;
        if (req.body.occupation !== undefined) updateFields.occupation = req.body.occupation;
        if (req.body.education !== undefined) updateFields.education = req.body.education;
        if (req.body.village !== undefined) updateFields.village = req.body.village;
        if (req.body.taluko !== undefined) updateFields.taluko = req.body.taluko;
        if (req.body.district !== undefined) updateFields.district = req.body.district;
        if (req.body.commitee !== undefined) updateFields.commitee = req.body.commitee;
        if (req.body.is_register !== undefined) updateFields.is_register = req.body.is_register;
        if (req.body.status !== undefined) updateFields.status = req.body.status;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query("SELECT * FROM mainmember WHERE id = ?", id, (err, rows) => {
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
                        "UPDATE mainmember SET ? WHERE id = ?",
                        [updateFields, id],
                        (err, rows) => {
                            connection.release();

                            if (!err) {
                                res.status(200).json({
                                    message: "MAIN MEMBER UPDATED SUCCESSFULLY",
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
    } catch (error) {
        console.log("---error---", error);
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
};

/*--- End Update main member ---*/

/*--- Get Main Member ---*/
exports.viewMemberById = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM mainmember WHERE id = ?", [req.params.id],
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "MAINMEMBER NOT FOUND",
                                status: 404
                            });
                        } else {
                            res.status(200).json({
                                message: "GET MAIN MEMBER PROFILE SUCCESSFULLY",
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
            )
        })

    } catch (error) {
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        })
    }
};

/*--- End Get Main Member ---*/

/*--- view all main members ---*/

exports.viewAllMember = async (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err; !


                connection.query(
                    "SELECT * FROM mainmember",
                    (err, rows) => {

                        connection.release();

                        if (!err) {
                            if (rows.length === 0) {
                                return res.status(404).json({
                                    message: "MAIN MEMBER NOT FOUND",
                                    status: 404
                                });
                            } else {
                                res.status(200).json({
                                    message: "GET ALL MAIN MEMBERS",
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
exports.deleteMember = (req, res) => {
    try {
        const memberId = req.params.id;
        const newStatus = 1;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "UPDATE mainmember SET status = ? WHERE id = ?",
                [newStatus, memberId],
                (err, result) => {
                    connection.release();

                    if (!err && result.affectedRows > 0) {
                        res.status(200).json({
                            message: "MAIN MEMBER DELETED SUCCESSFULLY",
                            status: 200
                        });
                    } else {
                        res.status(500).json({
                            message: "DATABASE QUERY ERROR OR MEMBER NOT FOUND",
                            status: 500
                        });
                    }
                }
            );
        });
    } catch (error) {
        res.status(500).json({
            message: "SOMETHING WENT WRONG",
            status: 500
        });
    }
};


/*--- total member ---*/
exports.totalMember = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT COUNT(*) AS totalmembers FROM mainmember",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        const totalMembers = rows[0].totalMembers;
                        res.status(200).json({
                            totalMembers: totalMembers,
                            message: "Total members counted successfully",
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




/*--- commitee member ---*/

exports.commiteeMemberList = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM mainmember WHERE commitee = 1",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        res.status(200).json({
                            message: "commitee members get successfully",
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



/*--- get deleted members ---*/

// exports.getdeletedMembers = async (req, res) => {
//     try {

//         pool.getConnection((err, connection) => {
//             if (err) throw err; !


//                 connection.query(
//                     "SELECT * FROM deleted_member",
//                     (err, rows) => {

//                         connection.release();

//                         if (!err) {
//                             if (rows.length === 0) {
//                                 return res.status(404).json({
//                                     message: "DELETED MEMBER NOT FOUND",
//                                     status: 404
//                                 });
//                             } else {
//                                 res.status(200).json({
//                                     message: "GET ALL DELETED MEMBERS",
//                                     status: 200,
//                                     data: rows
//                                 });
//                             }

//                         } else {

//                             res.status(500).json({
//                                 message: "DATABASE QUERY ERROR",
//                                 status: 500
//                             })

//                         }
//                     }
//                 );
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: "SOMETHING WENT WRONG",
//             status: 500
//         })
//     }
// };



exports.viewAllActiveMember = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM mainmember WHERE status ='0' ",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "ACTIVE MEMBER NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET ALL ACTIVE MEMBER SUCCESSFULLY",
                                status: 200,
                                data: rows
                            })
                        }
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

exports.deleteMemberList = (req, res) => {
    try {

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM mainmember WHERE status ='1' ",
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "DELETED MEMBER NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET ALL DELETED MEMBER SUCCESSFULLY",
                                status: 200,
                                data: rows
                            })
                        }
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

exports.searchDeleteMember = (req, res) => {
    try {

        const memberId = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM mainmember WHERE status ='1' AND id = ? ", [memberId],
                (err, rows) => {
                    connection.release();

                    if (!err) {
                        if (rows.length === 0) {
                            return res.status(404).json({
                                message: "DELETED MEMBER NOT FOUND",
                                status: 404
                            })
                        } else {
                            res.status(200).json({
                                message: "GET ALL DELETED MEMBER SUCCESSFULLY",
                                status: 200,
                                data: rows
                            })
                        }
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


