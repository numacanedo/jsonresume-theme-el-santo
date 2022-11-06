let fs = require("fs");
let path = require('path');
let Handlebars = require("handlebars");

MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

    Handlebars.registerHelper('format', function (startDate, endDate) {
        return format(startDate) + ' - ' + format(endDate);
    });

    Handlebars.registerHelper('duration', function (startDate, endDate) {
        let duration = calculateDuration(startDate, endDate);

        return ''
            .concat(pad(duration.years, 'y'))
            .concat(pad(duration.months, 'm'))
            .concat('|')
            .replaceAll(' ', '&nbsp;');
    });

    Handlebars.registerHelper('experience', function (work) {
        if (!work.at(-1).startDate) {
            return '';
        }

        let duration = calculateDuration(work.at(-1).startDate, '');

        return ''
            .concat(
                duration.years > 1
                    ? ''.concat(duration.years).concat(' years')
                    : duration.years > 0 ? ''.concat(duration.years).concat(' year') : '')
            .concat(
                duration.months > 1
                    ? ' and '.concat(duration.months).concat(' months')
                    : duration.years > 0 ? ' and '.concat(duration.months).concat(' month') : '')
            .concat(" of experience")
            .replaceAll(' ', '&nbsp;');
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

function calculateDuration(startDate, endDate) {
    let daysDuration = (toDate(endDate).getTime() - toDate(startDate).getTime()) / (1000 * 60 * 60 * 24);
    let years = Math.floor(daysDuration / 365);
    let months = Math.floor((daysDuration - (years * 365)) / 30)
    let days = Math.floor(daysDuration - ((years * 365) + (months * 30)))


    if (days > 20) {
        days = 0;
        months++;
    }

    if (months == 12) {
        months = 0;
        years++;
    }

    return {months: --months, years: years};
}

function pad(duration, unit) {
    let newDuration = duration ? ''.concat(duration).concat(unit) : ''
    return newDuration.padStart(unit.length + 2, ' ');
}

function toDate(date) {
    if (date == format(date)) {
        return new Date();
    }

    return new Date(date);
}

function format(date) {
    let dateToken = date.split('-');

    if (!dateToken[1]) {
        return date;
    }

    return MONTH[dateToken[1] - 1] + ' ' + dateToken[0];
}

module.exports = {
    render: render
};