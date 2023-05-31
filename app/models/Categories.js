const { sql } = require("../config/db.config");

const Categories = function (Categories) {
	this.name = Categories.name;
	this.image = Categories.image;

};

Categories.Add = async (req, res) => {
	if (!req.body.name || req.body.name === '') {
		res.json({
			message: "Please Enter Category name",
			status: false,
		});
	} else {
		sql.query(`CREATE TABLE IF NOT EXISTS public.categories (
        id SERIAL,
        name text NOT NULL,
		image text,
        createdAt timestamp NOT NULL,
        updatedAt timestamp ,
        PRIMARY KEY (id))  ` , (err, result) => {
			if (err) {
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			} else {
				sql.query(`INSERT INTO "categories" (id, name , createdAt ,updatedAt )
                            VALUES (DEFAULT, $1 , 'NOW()', 'NOW()') 
							RETURNING * `, [req.body.name], (err, result) => {
					if (err) {
						console.log(err);
						res.json({
							message: "Try Again",
							status: false,
							err
						});
					}
					else {
						res.json({
							message: "Category Added Successfully!",
							status: true,
							result: result.rows,
						});
					}

				})

			};
		});
	}
}

Categories.addImage = async (req, res) => {
	if (req.body.id === '') {
		res.json({
			message: "id is required",
			status: false,
		});
	} else {
		const userData = await sql.query(`select * from "categories" where id = $1`, [req.body.id]);
		if (userData.rowCount === 1) {

			let photo = userData.rows[0].image;
			// let image = userData.rows[0].image;
			// let cover_image = userData.rows[0].cover_image;

			let { id } = req.body;
			console.log(req.file)
			if (req.file) {
				const { path } = req.file;
				photo = path;
			}

			sql.query(`UPDATE "categories" SET image = $1 WHERE id = $2;`,
				[photo, id], async (err, result) => {
					if (err) {
						console.log(err);
						res.json({
							message: "Try Again",
							status: false,
							err
						});
					} else {
						if (result.rowCount === 1) {
							const data = await sql.query(`select * from "categories" where id = $1`, [req.body.id]);
							res.json({
								message: "categories Image added Successfully!",
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


Categories.GetCategories = (req, res) => {
	sql.query(`SELECT * FROM "categories" WHERE id = ${req.body.Category_ID};`, (err, result) => {
		if (err) {
			res.json({
				message: "Try Again",
				status: false,
				err
			});
		} else {
			res.json({
				message: "Specific Categories Details",
				status: true,
				result: result.rows
			});
		}
	});
}

Categories.GetAllCategories = async (req, res) => {
	const data = await sql.query(`SELECT COUNT(*) AS count FROM "categories"`);
	const Tads = await sql.query(`SELECT COUNT(*) AS count FROM "ads"`);

	let limit = 12;
	let limit1;
	let page = req.body.page;
	let category;
	let ads;
	if (!page || !limit) {
		category = await sql.query(`SELECT * FROM "categories" ORDER BY "createdat" DESC`);
	}
	if (page && limit) {
		const data = await sql.query(`SELECT COUNT(*) AS count FROM "categories"`);
		limit = parseInt(limit);
		let offset = (parseInt(page) - 1) * limit
		category = await sql.query(`SELECT * FROM "categories" ORDER BY "createdat" DESC
		LIMIT $1 OFFSET $2 ` , [limit, offset]);
	}
	for (let i = 0; i < category.rowCount; i++) {
		category.rows[i] = {
			...category.rows[i],
			type: 'category'
		}
	}
	if (category.rowCount !== 12) {
		limit1 = parseInt(12 - parseInt(category.rowCount));
		let offset = (parseInt(page) - 1) * limit;
		ads = await sql.query(`SELECT * FROM "ads" ORDER BY "createdat" DESC
		LIMIT $1 OFFSET $2 ` , [limit1, req.body.AdsOffset]);
		console.log("ads.rowCount");
		console.log(ads.rowCount);
		if (category.rowCount > 0) {
			if (ads.rowCount > 0) {
				ads.rows[0] = {
					...ads.rows[0],
					type: 'ad'
				}
				category.rows.splice(0, 0, ads.rows[0]);
			}
		}
		if (category.rowCount > 7) {
			if (ads.rowCount === 2) {
				ads.rows[1] = {
					...ads.rows[1],
					type: 'ad'
				}
				category.rows.splice(6, 0, ads.rows[1]);
			}
		} else {
			let j = category.rowCount + 1
			for (let i = 1; i < ads.rowCount; i++) {
				ads.rows[i] = {
					...ads.rows[i],
					type: 'ad'
				}
				category.rows.splice(j, 0, ads.rows[i]);
				j++;
			}
		}
		if (category.rowCount > 7 && category.rowCount < 12) {
			let j = category.rowCount + 1
			for (let i = 1; i < ads.rowCount; i++) {
				ads.rows[i] = {
					...ads.rows[i],
					type: 'ad'
				}
				category.rows.splice(j, 0, ads.rows[i]);
				j++;
			}
		}
	} else if (category.rowCount === 12) {
		limit1 = 2;
		let offset = (parseInt(page) - 1) * limit1
		ads = await sql.query(`SELECT * FROM "ads" ORDER BY "createdat" DESC
		LIMIT $1 OFFSET $2 ` , [limit1, offset]);
		if (ads.rowCount > 0) {
			ads.rows[0] = {
				...ads.rows[0],
				type: 'ad'
			}
			category.rows.splice(0, 0, ads.rows[0]);
		}
		if (ads.rowCount === 2) {
			ads.rows[1] = {
				...ads.rows[1],
				type: 'ad'
			}
			category.rows.splice(7, 0, ads.rows[1]);
		}

	}
	if (category.rows) {
		res.json({
			message: "All categories Details",
			status: true,
			totalAds: Tads.rows[0].count,
			InpageAds: ads.rowCount,
			TotalCatagory: data.rows[0].count,
			InPageCategories: category.rowCount,
			result: category.rows,
		});
	} else {
		res.json({
			message: "could not fetch",
			status: false
		})
	}

}

Categories.Update = async (req, res) => {
	if (req.body.Category_ID === '') {
		res.json({
			message: "id is required",
			status: false,
		});
	} else {
		const userData = await sql.query(`select * from "categories" where id = $1 
		`, [req.body.Category_ID]);

		if (userData.rowCount === 1) {

			const oldName = userData.rows[0].name;

			let { Category_ID, name } = req.body;
			if (name === undefined || name === '') {
				name = oldName;
			}
			sql.query(`UPDATE "categories" SET name = $1 WHERE id = $2;`,
				[name, Category_ID], async (err, result) => {
					if (err) {
						console.log(err);
						res.json({
							message: "Try Again",
							status: false,
							err
						});
					} else {
						if (result.rowCount === 1) {
							const data = await sql.query(`select * from "categories" where id = $1`, [req.body.Category_ID]);
							res.json({
								message: "Category Updated Successfully!",
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


Categories.Delete = async (req, res) => {
	const data = await sql.query(`select * from "categories" where id = ${req.params.id}`);
	if (data.rows.length === 1) {
		sql.query(`DELETE FROM categories WHERE id = ${req.params.id};`, (err, result) => {
			if (err) {
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			} else {
				res.json({
					message: "Categories Deleted Successfully!",
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
module.exports = Categories;