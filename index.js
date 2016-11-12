var path = require('path');
var fs = require('fs');
var mg = require('mailgun-js');

/* input file format
 * name,email,ticket-file-name
 */
var INPUT_FILE = process.env.input || 'input.txt';
var MAILGUN_DOMAIN = process.env.domain || '__DOMAIN__';
var MAILGUN_KEY = process.env.key || '__KEY___';

var DEBUG = true;
var mailgun = mg({
    apiKey: MAILGUN_KEY, 
    domain: MAILGUN_DOMAIN
});

var o = console.log;
console.log = function(arg) {
    if (DEBUG) {
        return o(arg);
    }
};

function parseAndSend() {
    var data = fs.readFileSync(INPUT_FILE).toString().split('\n');
    for (var i = 0; i < data.length; i++) {
        // each line is name,email,ticket-file-name
        var row = data[i].replace(" ", "").split(",");
        if (row[0] && row[1] && row[2]) {
            createAndSendEmail(row[0], row[1], row[2] + '.pdf'); 
        } else {
            console.log('===> BAD ROW INPUT: ' + row);
        }
    }
}

function createAndSendEmail(name, email, ticketFile) {
    var ticket = path.join(__dirname, ticketFile);
    if (!fs.existsSync(ticket)) {
        console.log('===> ERROR FILE NOT FOUND: ' + ticketFile);
        return;
    }

    var data = {
        from: 'IFG UBC <no-reply@napontaratan.com>',
        to: email,
        subject: 'Your ticket for the Singing Christmas Tree Concert with IFG',
        text: 'Hello ' + name + ' !\n\nGood news! Here is your ticket for the Singing Christmas Tree Concert for the Dec 2 - 7:30PM performance. Please bring this ticket with you on the day of the event. IFG will be leaving together on the day of the event - keep an eye on our Facebook event page for more details closer to the date!\n\nIt is still not too late to sign up for a ticket! However, the deadline is fast approaching. If you know a friend who want  to join us for the concert, please remind them to register soon!\n\nIf you have any questions please post your question on the Facebook event page!\n\nLINK: https://www.facebook.com/events/1772492879667654/\n\nThanks!\nYour friends at IFG',
		attachment: ticket 
	};

    mailgun.messages().send(data, function(err, body) {
        if (err) {
            console.log('Error sending: ' + email);
            console.log(err);
        } else {
            console.log('Success: ' + email);
            console.log(body);
        }
    });
}

parseAndSend();
