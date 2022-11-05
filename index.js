let fs = require("fs");
let path = require('path');
let Handlebars = require("handlebars");

MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function render(resume) {
    let css = fs.readFileSync(__dirname + "/style.css", "utf-8");
    let tpl = fs.readFileSync(__dirname + "/resume.hbs", "utf-8");

    let partialsDir = path.join(__dirname, 'partials');
    let filenames = fs.readdirSync(partialsDir);

    filenames.forEach(function (filename) {
        var matches = /^([^.]+).hbs$/.exec(filename);
        if (!matches) {
            return;
        }
        let name = matches[1];
        let filepath = path.join(partialsDir, filename)
        let template = fs.readFileSync(filepath, 'utf8');

        Handlebars.registerPartial(name, template);
    });

    Handlebars.registerHelper('format', function (date) {
        let newDate = date.split('-');
        return MONTH[newDate[1] - 1] + ' ' + newDate[0];
    });

    Handlebars.registerHelper('add-dot', function (text) {
        if ('.' === text.slice(-1)) {
            return text;
        }

        return text + '.';
    });

    return Handlebars.compile(tpl)({
        css: css,
        resume: resume
    });
}

module.exports = {
    render: render
};