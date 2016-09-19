// Hello ES6
'use strict';

// Initialize Config Map
const config = new Map();

// Database Information
config.set( 'db_name', 'codyogden_cc4');

config.set( 'port', process.env.PORT || 3000 );

// File Path
const filepath = require('path');

// Config Module
const port = config.get('port');

// Express Setup
const express = require('express');
const app = express();

// bodyParser Setup
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() );

app.use( express.static( filepath.resolve( 'server/public') ) );

// PostgreSQL Setup
const pg_config = {
	host: 'localhost',
	database: 'codyogden_cc4'
};
const Pool = require('pg').Pool;
const pool = new Pool( pg_config );

// Server listening?
app.listen( port, ( ) => {

	console.log( "app.js listening on port", port );

} );

// Main server route
app.route( '/' )
.get( ( req, res ) => {

	console.log( 'GET /' );

	// Send index.html
	res.sendFile( filepath.resolve( 'server/public/views/index.html' ) );

} );

// treats route
app.route( '/treats' )
.get( ( req, res ) => {

	console.log( 'GET /treats', req.body );

	var sql;
	var values = [];

	// If there is a query, use different SQL
	if( req.query.q ) {

		console.log( 'Searching for:', req.query.q );

		sql = "SELECT * FROM treat WHERE LOWER( name ) LIKE '%" + req.query.q + "%' OR LOWER( description ) LIKE '%" + req.query.q + "%';";

	} else {

		console.log( 'Returning all items.' );

		sql = 'SELECT * FROM treat;';

	}

	console.log( "sql", sql );

	// Query it
	pool.query( sql, ( err, result ) => {

		if( err ) {
			console.log( 'Error:', err );
			res.status( 500 ).send( { error: err } );
		}

		console.log( 'Result', result.rows );

		// Send the rows back
		res.send( result.rows );

	} );

} )
.post( ( req, res ) => {

	console.log( 'POST /treats', req.body );

	var sql = "INSERT INTO treat ( name, description, pic ) VALUES ( $1, $2, $3 );";

	var values = [ req.body.name, req.body.description, req.body.url ];

	pool.query( sql, values, ( err, result ) => {

		if( err ) {
			console.log("Error:", err);
			return res.status(500).send( {error: err} );
		}

		res.redirect( '/treats' );

	} );

} );