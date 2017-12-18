/* Timetable for Trains Module */

/* Magic Mirror
 * Module: SwissTransport
 *
 * By Benjamin Angst http://www.beny.ch
 * based on a Script from Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-swisstransport",{

	// Define module defaults
	defaults: {
		maximumEntries: 6, // Total Maximum Entries
        	updateInterval: 5 * 60 * 1000, // Update every 5 minutes.
		retryDelay: 15 * 60 * 1000, // Update every 5 minutes.
		animationSpeed: 2000,
		fade: true,
		fadePoint: 0.25, // Start on 1/4th of the list.
                initialLoadDelay: 0, // start delay seconds.
		
                apiBase: 'http://transport.opendata.ch/v1/connections',
                from: "Oberrieden",
                to: "Oerlikon",
                //direct: 1, // Directconnection = 1; Allow Transfer = 0;
                
		titleReplace: {
			"Zeittabelle ": ""
		},
	},

	// Define required scripts.
	getStyles: function() {
		return ["trainconnections.css", "font-awesome.css"];
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);
        this.url = this.config.apiBase + this.getParams();
		this.trains = [];
		this.loaded = false;

        this.updateTrains(this);
    },

    updateTrains: function(self) {
        self.sendSocketNotification('TRAIN_URL', self.url);
        setTimeout(self.updateTrains, self.config.updateInterval, self);
    },
    
	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.from === "") {
			wrapper.innerHTML = "Please set the correct Departure-Station name: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.to === "") {
			wrapper.innerHTML = "Please set the correct Final-Station name: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = "Loading trains ...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var table = document.createElement("table");
		table.className = "small";

		for (var t in this.trains) {
			var trains = this.trains[t];

			var row = document.createElement("tr");
			table.appendChild(row);

			var depCell = document.createElement("td");
			depCell.className = "departuretime";
			depCell.innerHTML = trains.departuretime;
			row.appendChild(depCell);
                
                        var trainFromCell = document.createElement("td");
			trainFromCell.className = "from";
			trainFromCell.innerHTML = trains.from;
			row.appendChild(trainFromCell);
                        
			var trainToCell = document.createElement("td");
			trainToCell.innerHTML = " - " + trains.to;
			trainToCell.className = "align-right trainto";
			row.appendChild(trainToCell);
                        /*
                        var arrCell = document.createElement("td");
			arrCell.className = "arrivaltime";
			arrCell.innerHTML = "(" + trains.arrivaltime + ")";
			row.appendChild(arrCell);
                        */
                        if(trains.delay) {
                            var delayCell = document.createElement("td");
                            delayCell.className = "delay red";
                            delayCell.innerHTML = "+" + trains.delay + " min";
                            row.appendChild(delayCell);
                        } else {
                            var delayCell = document.createElement("td");
                            delayCell.className = "delay red";
                            delayCell.innerHTML = trains.delay;
                            //row.appendChild(delayCell);
                        }
                        /*
			var durationCell = document.createElement("td");
			durationCell.innerHTML = "/ " + trains.duration;
			durationCell.className = "align-right duration";
			row.appendChild(durationCell);
                        */
			if (this.config.fade && this.config.fadePoint < 1) {
				if (this.config.fadePoint < 0) {
					this.config.fadePoint = 0;
				}
				var startingPoint = this.trains.length * this.config.fadePoint;
				var steps = this.trains.length - startingPoint;
				if (t >= startingPoint) {
					var currentStep = t - startingPoint;
					row.style.opacity = 1 - (1 / steps * currentStep);
				}
			}

		}

		return table;
	},

    /* getParams(compliments)
     * Generates an url with api parameters based on the config.
     *
     * return String - URL params.
     */
    getParams: function() {
        var params = "?";
        params += "from=" + this.config.from;
        params += "&to=" + this.config.to;
        params += "&page=0";
        //params += "&direct=" + this.config.direct;
        params += "&limit=" + this.config.maximumEntries;

        return params;
    },

    socketNotificationReceived: function(notification, payload) {
    	console.log(notification);
        if (notification === 'TRAIN_CONNECTIONS') {
            Log.info('received TRAIN_CONNECTIONS');
            var data = payload.trains;

            this.trains = [];

            for (var i = 0, count = data.connections.length; i < count; i++) {

                var trains = data.connections[i];
                this.trains.push({

                    departuretime: moment(trains.from.departureTimestamp * 1000).format("HH:mm"),
                    arrivaltime: moment(trains.to.arrivalTimestamp * 1000).format("HH:mm"),
                    duration: moment.utc((trains.to.arrivalTimestamp-trains.from.departureTimestamp)*1000).format("HH:mm"),
                    delay: trains.from.delay,
                    from: trains.from.station.name,
                    to: trains.to.station.name
                });
            }

            this.loaded = true;
            this.updateDom(1000);
        }
    }

});
