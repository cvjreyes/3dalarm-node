module.exports = app => {
    const alarms = require("./alarms.controller.js");

    app.get("/getAlarms", alarms.getAlarms);
    app.post("/submitAlarms", alarms.submitAlarms)
    app.post("/refresh", alarms.refresh)
    app.post("/runBat", alarms.runBat)
    
  };