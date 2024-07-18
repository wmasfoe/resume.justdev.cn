const pug = require('pug');
const jsonData = require('./resume.json');

const html = pug.renderFile('./resume.pug', {
  resume: jsonData
});

console.log(html)