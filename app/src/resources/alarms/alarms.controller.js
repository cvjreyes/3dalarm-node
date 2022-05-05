const sql = require("../../db.js");
const fs = require("fs");
var path = require('path')
const cp = require('child_process')

const getAlarms = (req, res) =>{
    sql.query('SELECT files.id, `name`, `code`, `server`, file_type, file_path, exec_path, file_date, current_size, previous_size, bat_running, priority FROM files LEFT JOIN projects ON project_id = projects.id ORDER BY `name`, priority', (err, results)=>{
        res.json({
            rows: results
        }).status(200)
    })
}

const submitAlarms = async(req, res) =>{
    const rows = req.body.rows
    for(let i = 0; i < rows.length; i++){
      if(!rows[i]["Path"] || rows[i]["Path"] == ""){
        await sql.query("DELETE FROM files WHERE id = ?", [rows[i]["id"]], (err, results)=>{
            if(err){
                console.log(err)
                res.status(401)
            }
        })
      }else{
        await sql.query("SELECT id FROM projects WHERE name = ?", [rows[i]["Project"]], async(err, results)=>{
            if(err){
                console.log(err)
                res.status(401)
            }else{
                let project_id = results[0].id
                await sql.query("SELECT * FROM files WHERE id = ?", [rows[i]["id"]], async (err, results)=>{
                   
                    if(!results[0]){
                      await sql.query("INSERT INTO files(project_id, file_path, exec_path) VALUES(?,?,?)", [project_id, rows[i]["Path"], rows[i]["Executable path"]], (err, results)=>{
                        if(err){
                                console.log(err)
                                res.status(401)
                            }
                        })
                    }else{
                        let extension = path.extname(rows[i]["Path"]).replaceAll('.', '')
                        await sql.query("UPDATE files SET project_id = ?, file_path = ?, file_type = ?, exec_path = ?, priority = ? WHERE id = ?", [project_id, rows[i]["Path"], extension, rows[i]["Executable path"], rows[i]["Priority"], rows[i]["id"]], (err, results) =>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }
                        })
                    }
                }) 
            }
        })
        
      }
    }
    res.send({success: true}).status(200)
  }

const refresh = (req, res) =>{
    sql.query('SELECT files.id, file_path FROM files', async (err, results)=>{
        const files = results
        let extensions = []
        let sizes = []
        let dates = []
        for(let i = 0; i < files.length; i++){
            if (await fs.existsSync(files[i].file_path)) {
                extensions.push(path.extname(files[i].file_path).replace('.',''))
                fs.stat(files[i].file_path, async (err, stats) => {
                    if(err) {
                        throw err;
                    }
                    dates.push(stats.mtime)
                    sizes.push(stats.size)
                    await sql.query("UPDATE files SET previous_size = current_size WHERE id = ?", files[i].id, (err, results)=>{
                        if(err){
                            console.log(err)
                        }else{
                            sql.query("UPDATE files SET file_type = ?, file_date = ?, current_size = ? WHERE id = ?", [extensions[i], dates[i], sizes[i], files[i].id], (err, results)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    sql.query("SELECT file_date, bat_start_date, bat_running FROM files WHERE id = ?", files[i].id, (err, results)=>{
                                        if(!results[0]){
                                            console.log("Faltan datos")
                                        }else{
                                            let file_date = results[0].file_date
                                            let bat_start_date = results[0].bat_start_date
                                            let bat_running = results[0].bat_running
                                            if(bat_running == 1 && file_date != bat_start_date){
                                                sql.query("UPDATE files SET bat_running = 0 WHERE id = ?", files[i].id, (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                    }
                                                })
                                            }
                                        }
                                        res.status(200)
                                    })
                
                                }
                            })
                        }
                    })
                });
            }
            

            

        }
    })
}

const runBat = (req, res) =>{
    sql.query("SELECT file_date FROM files WHERE exec_path = ?", [req.body.path], (err, results)=>{
        const date = results[0].file_date
        sql.query("UPDATE files SET bat_running = 1, bat_start_date = ? WHERE exec_path = ?", [date, req.body.path], (err, results) =>{
            if(err){
                console.log(err)
            }
        })
    })
    
    cp.exec(req.body.path, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
            
        }
    })
}

module.exports = {
    getAlarms,
    submitAlarms,
    refresh,
    runBat
};
