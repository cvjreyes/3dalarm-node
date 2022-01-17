const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();

app.use(bodyParser.json({limit:"100mb"}));
app.use(cors());
// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
;

const dotenv = require('dotenv');
dotenv.config();

require("./resources/users/user.routes.js")(app);
require("./resources/auth/auth.routes.js")(app);

app.listen(process.env.NODE_DB_PORT, () => {
  console.log('Example app listening on port 8000!')
});