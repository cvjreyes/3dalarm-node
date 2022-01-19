module.exports = app => {
    const projects = require("./projects.controller.js");

    app.get("/getProjects", projects.getProjects);
    app.post("/submitProjects", projects.submitProjects);
    
  };