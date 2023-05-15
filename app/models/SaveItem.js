const {sql} = require("../config/db.config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SaveItem = function (SaveItem) {
	this.item_ID = SaveItem.item_ID;
	this.user_ID = SaveItem.user_ID;;
};

SaveItem.SaveItem = async (req, res) => {
	if (!req.body.item_ID || req.body.item_ID === '') {
		res.json({
			message: "Please Enter item_ID",
			status: false,
		});
	} else if (!req.body.user_ID) {
		res.json({
			message: "Please Enter user_ID",
			status: false,
		});
	} else {
		sql.query(`CREATE TABLE IF NOT EXISTS public.saveitems (
        id SERIAL,
        item_id SERIAL NOT NULL,
        user_id SERIAL NOT NULL,
        createdAt timestamp,
        updatedAt timestamp ,
        PRIMARY KEY (id));  ` , (err, result) => {
			if (err) {
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			} else {
				sql.query(`INSERT INTO saveitems (id, item_id , user_id, createdAt ,updatedAt )
                            VALUES (DEFAULT, $1  ,  $2, 'NOW()', 'NOW()') 
							RETURNING * `,[req.body.item_ID, req.body.user_ID], (err, result) => {
					if (err) {
						res.json({
							message: "Try Again",
							status: false,
							err
						});
					}
					else {
						res.json({
							message: "item Saved Successfully!",
							status: true,
							result: result.rows,
						});
					}

				})

			};
		});
	}
}

SaveItem.UnSaveItem = async (req, res) => {
	const data = await sql.query(`select * from saveitems where item_id = ${req.body.item_ID} 
	AND user_id = ${req.body.user_ID} `);
	if (data.rows.length === 1) {
		sql.query(`DELETE FROM saveitems WHERE item_id = $1 AND user_id = $2 ;`,[req.body.item_ID, req.body.user_ID], (err, result) => {
			if (err) {
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			} else {
				res.json({
					message: "item Unsaved Successfully!",
					status: true,
					result: data.rows,

				});
			}
		});
	} else {
		res.json({
			message: "Not Found",
			status: false,
		});
	}
}

SaveItem.ViewSaveItem = (req, res) => {
	sql.query(`SELECT  "user".username, "user".email , "user".phone,
	"user".country_code, "user".image AS User_Image ,"user".cover_image AS Cover_Image ,"user".status ,
	"items".* FROM "saveitems" JOIN "user" 
	ON "saveitems".user_id = "user".id JOIN "items" ON  "items".id = "saveitems".item_id where user_id = $1;`,[req.body.user_ID], (err, result) => {
		if (err) {
			console.log(err);
			res.json({
				message: "Try Again",
				status: false,
				err
			});
		} else {
			res.json({
				message: "item Details",
				status: true,
				result: result.rows,
			});
		}
	});

}

// SaveItem.viewSpecific = (req, res) => {
// 	sql.query(`SELECT * FROM saveitems WHERE id = $1;`,[req.body.id], (err, result) => {
// 		if (err) {
// 			res.json({
// 				message: "Try Again",
// 				status: false,
// 				err
// 			});
// 		} else {
// 			res.json({
// 				message: "item Details",
// 				status: true,
// 				result: result.rows
// 			});
// 		}
// 	});
// }




// SaveItem.UpdateSaveItem = (req, res) => {
// 	if (!req.body.item_ID || req.body.item_ID === '') {
// 		res.json({
// 			message: "Please Enter your item_ID",
// 			status: false,
// 		});
// 	} else if (req.body.user_ID === '') {
// 		res.json({
// 			message: "Please Enter your user_ID",
// 			status: false,
// 		});
// 	} else {
// 		sql.query(`UPDATE saveitems SET item_ID = $1, user_ID = $2 WHERE
// 		 id = $3;`, [req.body.item_ID,req.body.user_ID, req.body.id] ,async (err, result) => {
// 			if (err) {
// 				res.json({
// 					message: "Try Again",
// 					status: false,
// 					err
// 				});
// 			} else {
// 				if(result.rowCount === 1){	
// 				const data = await sql.query(`select * from saveitems where id = ${req.body.id}`);
// 				res.json({
// 					message: "item Updated Successfully!",
// 					status: true,
// 					result:  data.rows,
// 				});
// 			}else if(result.rowCount === 0){
// 				res.json({
//                     message: "Not Found",
//                     status: false,
//                 });
// 			}
// 			}
// 		});
// 	}
// }

module.exports = SaveItem;