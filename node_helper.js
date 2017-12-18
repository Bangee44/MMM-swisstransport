/* Timetable for Trains Module */

/* Magic Mirror
 * Module: SwissTransport
 *
 * By Benjamin Angst http://www.beny.ch
 * based on a Script from Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
    start: function () {
        console.log('MMM-Trainconnections helper started ...');
    },

    getTrains: function(api_url) {
        var self = this;
        request({url: api_url, method: 'GET'}, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var trains = JSON.parse(body);
                self.sendSocketNotification('TRAIN_CONNECTIONS', {'trains':trains});
            }
        });
    },

    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
        //console.log(notification);
        if (notification === 'TRAIN_URL') {
            this.getTrains(payload);
        }
    }

});
