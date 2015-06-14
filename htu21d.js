/*
 Copyright 2015 Maxwell Hadley

 See accompanying LICENSE file for terms of use
*/
 
// HTU21D Node-RED node file
module.exports = function(RED) {
	var HTU21D = require("node-htu21d");

// Set the htu21d debug option from the environment variable
	var debugOption = false;
	if (process.env.hasOwnProperty("RED_DEBUG") && process.env.RED_DEBUG.indexOf("htu21d") >= 0) {
		debugOption = true;
	}

    function htu21d_Node(config) {
        RED.nodes.createNode(this, config);

        // node configuration
		this.device = config.device;
		this.timer = config.timer * 1000;
		this.name = config.name;
		this.temperatureUnits = config.temperatureUnits || "degC";
		this.dewpointUnits = config.dewpointUnits || "degC";
		var node = this;
		
		var sensor = new HTU21D(this.device, 0x40);
		
		var measure = function () {
			// TODO: error handling
			var temperature, humidity, dewpoint, msg;
			const A = 8.1332, B = 1762.39, C = 235.66;
			temperature = sensor.temperature();
			humidity = sensor.humidity();
			dewpoint = -(B/(Math.log(humidity/100)*Math.LOG10E - B/(temperature + C)) + C);
            if (node.temperatureUnits === "degF") {
                temperature = 32 + temperature*1.8;
            }
            if (node.dewpointUnits === "degF") {
                dewpoint = 32 + dewpoint*1.8;
            }
            msg = { payload: {temperature: temperature, humidity: humidity, dewpoint: dewpoint} };
            node.send(msg);
			};

		measure(); // run on start
		
		tID = setInterval(measure, this.timer);

		node.on("close", function() {
			clearInterval(tID);
		});
    }

    // Register the node by name.
    RED.nodes.registerType("htu21d", htu21d_Node);
};
