const sql = require("../../db.js");

const getProjects = (req, res) =>{
    sql.query('SELECT id, name, code, server FROM projects', (err, results)=>{
        res.json({
            rows: results
        }).status(200)
    })
}

const submitProjects = (req, res) =>{
    const rows = req.body.rows
    
    for(let i = 0; i < rows.length; i++){
      if(!rows[i]["Name"] || rows[i]["Name"] == ""){
        sql.query("DELETE FROM projects WHERE id = ?", [rows[i]["id"]], (err, results)=>{
            if(err){
                console.log(err)
                res.status(401)
            }
        })
      }else{
        sql.query("SELECT * FROM projects WHERE id = ?", [rows[i]["id"]], (err, results)=>{
            if(!results[0]){
              sql.query("INSERT INTO projects(name, code, server) VALUES(?,?,?)", [rows[i]["Name"], rows[i]["Code"], rows[i]["Server"]], (err, results)=>{
                if(err){
                        console.log(err)
                        res.status(401)
                    }
                })
            }else{
                sql.query("UPDATE projects SET name = ?, code = ?, server = ? WHERE id = ?", [rows[i]["Name"], rows[i]["Code"], rows[i]["Server"], rows[i]["id"]], (err, results) =>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }
                })
            }
        }) 
      }
    }
    res.send({success: true}).status(200)

  }

module.exports = {
    getProjects,
    submitProjects
};