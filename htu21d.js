/*
 Copyright 2015 Maxwell Hadley

 See accompanying LICENSE file for terms of use
*/
 
module.exports = function(RED) {
    // The (C++) library we are using to talk to the chip
	var htu21d = require("htu21d");

    // Set the htu21d debug option from the environment variable
    // TODO: Something is catching exceptions before we get a chance to handle them & output any debug
	var debugOption = false;
	if (process.env.hasOwnProperty("RED_DEBUG") && process.env.RED_DEBUG.indexOf("htu21d") >= 0) {
		debugOption = true;
	}

    function htu21dNode(config) {
        RED.nodes.createNode(this, config);

		this.device = config.device;                                // The I2C bus device path
		this.updateInterval = config.updateInterval * 1000;         // Interval between measurements in milliseconds
		this.temperatureUnits = config.temperatureUnits || "degC";
		this.dewpointUnits = config.dewpointUnits || "degC";
        this.name = config.name;

        this.timerID = null;                                        // Save the timer handle to cancel on close
		var node = this;
		
		var sensor = new htu21d.Htu21d(this.device, 0x40);
		
		// Request temperature & humidity, triggering a separate I2C operation for each. The C++
		// library does NOT use the clock-stretching mode of the chip, so other devices can use the bus
        // during the 50ms or so wait while the chip does its stuff
        var measure = function () {
                var temperature, humidity, dewpoint;
                const B = 1762.39, C = 235.66;
                temperature = sensor.temperature();
                humidity = sensor.humidity();
                dewpoint = -(B/(Math.log(humidity/100)*Math.LOG10E - B/(temperature + C)) + C);
                if (node.temperatureUnits === "degF") {
                    temperature = 32 + temperature*1.8;
                }
                if (node.dewpointUnits === "degF") {
                    dewpoint = 32 + dewpoint*1.8;
                }
                node.send({payload: {temperature: temperature, humidity: humidity, dewpoint: dewpoint}});
			};

        // Wait for everything else to load, set the highest-resolution operating mode, make an initial
        // measurement and kick off the update timer
		setTimeout(function () {
                sensor.setMode(0);
                measure();
                node.timerID = setInterval(measure, node.updateInterval);
            }, 50
        );

        // Tidy up on close, by cancelling the timer if we set one
		node.on("close", function() {
			if (node.timerID !== null) {
                clearInterval(node.timerID);
            }
		});
    }

    // Register the node
    RED.nodes.registerType("htu21d", htu21dNode);
};
