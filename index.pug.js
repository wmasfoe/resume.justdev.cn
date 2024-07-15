var pug = require('pug');

var html = pug.renderFile('./resume.pug', merge({}, {}));

console.log(html)