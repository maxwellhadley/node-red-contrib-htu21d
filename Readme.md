node-red-contrib-htu21d
========================

A <a href="http://nodered.org" target="_new">Node-RED</a> node to query and receive data from 
[Measurement Specialities HTU21D](http://www.meas-spec.com/product/humidity/HTU21D.aspx) humidity and
temperature sensors. These pre-calibrated sensors are interfaced using the I2C bus. The node also calculates
the dewpoint temperature from the measured humidity and temperature.

Install
-------

Use npm to install this package locally in the Node-RED data directory (by default, `$HOME/.node-red`):

	cd $HOME/.node-red
	npm install node-red-contrib-htu21d

Alternatively, it can be installed globally:

    npm install -g node-red-contrib-htu21d

The nodes will be added to the palette the next time node-RED is started.

Requirements
------------

This node uses the [htu21d](https://www.npmjs.com/package/htu21d) npm package to access the device over an I2C bus.
This is generally supported only on Linux. The bus device name (e.g. /dev/i2c-1) is configurable: only one actual sensor
is allowed on each bus, but the bus can be shared with any other I2C device not using the (7-bit) address 0x40.

Usage
-----

The output message payload holds the following properties:

**humidity** - relative humidity in %

**temperature** - temperature in ˚C or ˚F as configured

**dewpoint** - calculated dewpoint in ˚C or ˚F as configured

Measurements are repeated at a configurable interval: each measurement takes just over 0.1 second.

