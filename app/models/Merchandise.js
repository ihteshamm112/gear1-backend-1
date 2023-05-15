const { sql } = require("../config/db.config");

const Merchandise = function (Merchandise) {
	this.userID = Merchandise.userID
	this.images = Merchandise.images;
	this.name = Merchandise.name;
	this.price = Merchandise.price;
	this.category_id = Merchandise.category_id;
	this.description = Merchandise.description;
	// this.likes = Merchandise.likes;
	// this.shares = Merchandise.shares;
};

Merchandise.Add = async (req, res) => {
	if (!req.body.userID || req.body.userID === '') {
		res.json({
			message: "Please Enter user-ID",
			status: false,
		});
	} else {
		// likes INTEGER,
		// shares INTEGER,	
		sql.query(`CREATE TABLE IF NOT EXISTS public.merchandise (
        id SERIAL NOT NULL,
        userid SERIAL NOT NULL,
        images TEXT[],
        name text,
		price text,
        category_id text,
        description text,
        createdAt timestamp NOT NULL,
        updatedAt timestamp ,
        PRIMARY KEY (id));` , (err, result) => {
			if (err) {
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			} else {
				sql.query(`INSERT INTO merchandise (id, userid ,images, name,price,category_id,description , createdAt ,updatedAt )
                            VALUES (DEFAULT, $1  ,  $2, $3, $4, $5 ,$6,  'NOW()', 'NOW()') RETURNING * `
					, [req.body.userID, [], req.body.name, req.body.price,
					req.body.category_id, req.body.description], (err, result) => {
						if (err) {

							res.json({
								message: "Try Again",
								status: false,
								err
							});
						}
						else {
							res.json({
								message: "Merchandise added Successfully!",
								status: true,
								result: result.rows,
							});
						}

					})

			};
		});
	}
}


Merchandise.addImages = async (req, res) => {
	if (req.body.id === '') {
		res.json({
			message: "id is required",
			status: false,
		});
	} else {
		const userData = await sql.query(`select * from "merchandise" where id = $1`, [req.body.id]);
		if (userData.rowCount === 1) {

			let photo = userData.rows[0].images;
			console.log(photo.length);
			if (photo.length < 5) {
				if (req.files.length < 6) {
					if(photo.length + 1 + req.files.length <= 5 ){
						let { id } = req.body;
						if (req.files) {
							req.files.forEach(function (file) {
								photo.push(file.path)
							})
						}
						sql.query(`UPDATE "merchandise" SET images = $1 WHERE id = $2;`,
							[photo, req.body.id], async (err, result) => {
								if (err) {
									console.log(err);
									res.json({
										message: "Try Again",
										status: false,
										err
									});
								} else {
									if (result.rowCount === 1) {
										const data = await sql.query(`select * from "merchandise" where id = $1`, [req.body.id]);
										res.json({
											message: "Merchandise Images added Successfully!",
											status: true,
											result: data.rows,
										});
									} else if (result.rowCount === 0) {
										res.json({
											message: "Not Found",
											status: false,
										});
									}
								}
							});
					}else{
						res.json({
							message: "Max 5 images allowed (Selected images will exceed this limit)",
							status: false,
						});
					}
				}
				else {
					res.json({
						message: "Max 5 images allowed",
						status: false,
					});
				}
			}else{
				res.json({
					message: "No More images allowed",
					status: false,
				});
			}
		} else {
			res.json({
				message: "Not Found",
				status: false,
			});
		}
	}
}


Merchandise.GetMerchandise = (req, res) => {
	sql.query(`SELECT "merchandise".* , "categories".name AS Catagory_name  FROM "merchandise" JOIN "categories" 
	ON  CAST( "merchandise".category_id AS INT) = "categories".id WHERE "merchandise".id = $1 `
		, [req.body.Merchandise_ID], (err, result) => {
			if (err) {
				console.log(err);
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			} else {
				res.json({
					message: "merchandise data",
					status: true,
					result: result.rows,
				});
			}
		});

}


Merchandise.GetAllMerchandise = (req, res) => {
	sql.query(`SELECT "merchandise".* , "categories".name AS Catagory_name  FROM "merchandise" JOIN "categories" 
	ON  CAST( "merchandise".category_id AS INT) = "categories".id `
		, (err, result) => {
			if (err) {
				console.log(err);
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			} else {
				res.json({
					message: "All Merchandise list",
					status: true,
					result: result.rows,
				});
			}
		});

}

// Merchandise.GetMerchandiseByCategory = (req, res) => {
// 	sql.query(`SELECT * FROM "merchandise" WHERE category_id = $1 `
// 		, [req.body.category_ID], (err, result) => {
// 			if (err) {
// 				console.log(err);
// 				res.json({
// 					message: "Try Again",
// 					status: false,
// 					err
// 				});
// 			} else {
// 				res.json({
// 					message: "Category's merchandise data",
// 					status: true,
// 					result: result.rows,
// 				});
// 			}
// 		});

// }


// Merchandise.search = (req, res) => {
// 	sql.query(`SELECT * FROM "merchandise" WHERE name = $1 `
// 		, [req.body.name], (err, result) => {
// 			if (err) {
// 				console.log(err);
// 				res.json({
// 					message: "Try Again",
// 					status: false,
// 					err
// 				});
// 			} else {
// 				res.json({
// 					message: "Search's merchandise data",
// 					status: true,
// 					result: result.rows,
// 				});
// 			}
// 		});

// }


Merchandise.Update = async (req, res) => {
	if (req.body.Merchandise_ID === '') {
		res.json({
			message: "id is required",
			status: false,
		});
	} else {
		const userData = await sql.query(`select * from "merchandise" where id = $1 
		`, [req.body.Merchandise_ID]);

		if (userData.rowCount === 1) {

			const oldName = userData.rows[0].name;
			const oldCategory_id = userData.rows[0].category_id;
			const oldPrice = userData.rows[0].price;
			const oldDescription = userData.rows[0].description;

			let { Merchandise_ID, name, category_id, price, description } = req.body;
			if (name === undefined || name === '') {
				name = oldName;
			}
			if (category_id === undefined || category_id === '') {
				category_id = oldCategory_id;
			}
			if (price === undefined || price === '') {
				price = oldPrice;
			}

			if (description === undefined || description === '') {
				description = oldDescription;
			}
			sql.query(`UPDATE "merchandise" SET name = $1, category_id = $2, 
		price = $3, description = $4 WHERE id = $5;`,
				[name, category_id, price, description, Merchandise_ID], async (err, result) => {
					if (err) {
						console.log(err);
						res.json({
							message: "Try Again",
							status: false,
							err
						});
					} else {
						if (result.rowCount === 1) {
							const data = await sql.query(`select * from "merchandise" where id = $1`, [req.body.Merchandise_ID]);
							res.json({
								message: "Merchandise Updated Successfully!",
								status: true,
								result: data.rows,
							});
						} else if (result.rowCount === 0) {
							res.json({
								message: "Not Found",
								status: false,
							});
						}
					}
				});
		} else {
			res.json({
				message: "Not Found",
				status: false,
			});
		}
	}
}


Merchandise.Delete = async (req, res) => {
	const data = await sql.query(`select * from merchandise WHERE id = $1 `
		, [req.body.Merchandise_ID])
	if (data.rows.length === 1) {
		sql.query(`DELETE FROM merchandise WHERE id = ${req.body.Merchandise_ID};`, (err, result) => {
			if (err) {
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			} else {
				res.json({
					message: "Item Deleted Successfully!",
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


module.exports = Merchandise;