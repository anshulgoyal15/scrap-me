const workers = require("./woker");

workers("tt2193021", 2)
  .then(console.log)
  .catch(console.error);
