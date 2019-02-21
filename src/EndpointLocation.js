'use strict';
/**
 * @description A URL manipulation utility similar to the familiar `Location` 
 *	interface (in `window`).  The main difference is that 
 *	`Location`'s API only accepts a URL string (and another `Location` object 
 *	via `toString()`), but `EndpointLocation`'s API allows all that plus 
 *	"construction by configuration" and empty construction for convenience.
 * @version 1.1.0 (2019-02-20)
 * 	1.0.0 (2018-12-28)
 * @author Mark M. Young
 * @example
 *  let clientEndpoint = new EndpointLocation(
 *	{
 *		'hostname':'example.com',
 *		'pathname':'/'.concat( ['path', 'to', 'endpoint'].join( '/' )),
 *		'params':{'hash':'of', 'url':'parameters'},
 *		'protocol':'https:',
 *	});
 *	request.get(
 *		{
 *			'headers':
 *			{
 *				'Accept':'application/json',
 *				'User-Agent':'request',
 *			},
 *			// The convenience of `EndpointLocation`.
 *			'url':clientEndpoint.href,// "https://example.com/path/to/endpoint?hash=of&url=parameters"
 *		},
 *		function response_handler( error, httpResponse, responseText )
 *		{});
 * }));
 * @see https://www.w3.org/TR/html50/browsers.html#the-location-interface
 * 
 * @callback URIComponentDecoder
 * @param {string} uri_component - A URI component to decode.
 *
 * @callback URIComponentEncoder
 * @param {string} uri_component - A URI component to encode.
 * 
 * @class EndpointLocation
 * @property {!URIComponentDecoder} [endpointLocation.uriComponentDecoder=decodeURIComponent] - A function for decoding query "search" parameters.  
 * 	For example, `decodeURIComponent`, `decodeURI`, or a function which uses one of these then replaces '+'s with spaces.
 * @property {!URIComponentEncoder} [endpointLocation.uriComponentEncoder=encodeURIComponent] - A function for encoding query "search" parameters.  
 * 	For example, `encodeURIComponent`, `encodeURI`, or a function which uses one of these then replaces spaces with '+'s.
 * @property {!string} [endpointLocation.hash=''] - The hash component of a parsed URL, starting with a pound sign ('#') if specified.
 * @property {!string} endpointLocation.host - The calculated host component of a parsed URL.
 * @property {!string} endpointLocation.href - The calculated href component of a parsed URL.
 * @property {!string} [endpointLocation.hostname=''] - The hostname component of a parsed URL.
 * @property {!Object} [endpointLocation.params={}] - The search component of a parsed URL represented as a key/value hash object.
 * @property {!string} [endpointLocation.pathname='/'] - The pathname component of a parsed URL, starting with a slash ('/').
 * @property {!string} [endpointLocation.port=''] - The port component of a parsed URL.
 * @property {!string} [endpointLocation.protocol='https:'] - The protocol component of a parsed URL, ending with a colon (':').
 * @property {!string} endpointLocation.search - The calculated search component of a parsed URL.
 */
class EndpointLocation// extends Location
{
	/**
	 * @param {(EndpointLocation|string)} endpointLocation - A URL string or another EndpointLocation object.
	 */
	constructor( endpointLocation )
	{
		let hidden =
		{
			'hash':'',
			'hostname':'',
			'params':{},
			'pathname':'/',
			'port':'',
			'protocol':'https:',
			'uriComponentDecoder':decodeURIComponent,
			'uriComponentEncoder':encodeURIComponent,
		};
		// Using properties for continuous validation.
		Object.defineProperties( this,
		{
			// 'hash' is either empty string or starts with '#'.
			'hash':
			{
				'enumerable':true,
				'get':function()
				{return( hidden.hash );},
				'set':function( value )
				{
					if((typeof( value ) === 'string' || value instanceof String)
						&& (value === '' || value.startsWith( '#' ))
					)
					{hidden.hash = value;}
					else
					{throw( new TypeError( "'hash' must be an empty string or start with '#'." ));}
				},
			},
			'hostname':
			{
				'enumerable':true,
				'get':function()
				{return( hidden.hostname );},
				'set':function( value )
				{
					if( typeof( value ) === 'string' || value instanceof String )
					{hidden.hostname = value;}
					else
					{throw( new TypeError( "'hostname' must be a string." ));}
				},
			},
			'params':
			{
				'enumerable':true,
				'get':function()
				{return( hidden.params );},
				'set':function( value )
				{
					if( typeof( value ) === 'object' && value !== null )
					{hidden.params = value;}
					else
					{throw( new TypeError( "'params' must be a non-null object." ));}
				},
			},
			// 'pathname' always starts with '/'.
			'pathname':
			{
				'enumerable':true,
				'get':function()
				{return( hidden.pathname );},
				'set':function( value )
				{
					if((typeof( value ) === 'string' || value instanceof String)
						&& value.startsWith( '/' )
					)
					{hidden.pathname = value;}
					else
					{throw( new TypeError( "'pathname' must start with '/'." ));}
				},
			},
			// 'port' is an empty string or parsable as a positive integer.
			'port':
			{
				'enumerable':true,
				'get':function()
				{return( hidden.port );},
				'set':function( value )
				{
					if( value === '' )
					{hidden.port = value;}
					else
					{
						let parsed = Number( value );
						let stringified = parsed.toString();
						if( Number.isInteger( parsed ) && parsed > 0
							// Make sure 'value' is not something weird like '080'.
							&& (((typeof( value ) === 'string' || value instanceof String) && stringified === value)
								|| ((typeof( value ) === 'number' || value instanceof Number) && parsed === value)
							)
						)
						{hidden.port = stringified;}
						else
						{throw( new TypeError( "'port' must parsable as a positive integer." ));}
					}
				},
			},
			// 'protocol' always ends with ':'.
			'protocol':
			{
				'enumerable':true,
				'get':function()
				{return( hidden.protocol );},
				'set':function( value )
				{
					if((typeof( value ) === 'string' || value instanceof String)
						&& value.endsWith( ':' )
					)
					{hidden.protocol = value;}
					else
					{throw( new TypeError( "'protocol' must end with ':'." ));}
				},
			},
			'uriComponentDecoder':
			{
				'enumerable':true,
				'get':function()
				{return( hidden.uriComponentDecoder );},
				'set':function( value )
				{
					if( typeof( value ) === 'function' )
					{hidden.uriComponentDecoder = value;}
					else
					{throw( new TypeError( "'uriComponentDecoder' must be a function." ));}
				},
			},
			'uriComponentEncoder':
			{
				'enumerable':true,
				'get':function()
				{return( hidden.uriComponentEncoder );},
				'set':function( value )
				{
					if( typeof( value ) === 'function' )
					{hidden.uriComponentEncoder = value;}
					else
					{throw( new TypeError( "'uriComponentEncoder' must be a function." ));}
				},
			},
		});
		//TODO add 'username' and 'password' properties
		if( !!endpointLocation )
		{this.assign( endpointLocation );}
	}
	/**
	 * @param {(EndpointLocation|string)} endpointLocation - A URL string or another EndpointLocation object.
	 */
	assign( endpointLocation )
	{
		if( typeof( endpointLocation ) === 'object' && endpointLocation !== null )
		{
			this.hash = endpointLocation.hash || this.hash;
			this.hostname = endpointLocation.hostname || this.hostname;
			this.params = endpointLocation.params
				|| EndpointLocation.decodeSearchParameters( endpointLocation.search )
				|| this.params;
			this.pathname = endpointLocation.pathname || this.pathname;
			this.port = endpointLocation.port || this.port;
			this.protocol = endpointLocation.protocol || this.protocol;
			this.uriComponentDecoder = endpointLocation.uriComponentDecoder || this.uriComponentDecoder;
			this.uriComponentEncoder = endpointLocation.uriComponentEncoder || this.uriComponentEncoder;
		}
		else if( typeof( endpointLocation ) === 'string' )
		{
			const matches = endpointLocation.match( EndpointLocation.URLRegExp ) || [];
			if( matches.length == 10 )
			{
				let host_parts = (matches[ 4 ] || '').split( ':' );
				if( host_parts.length < 2 )
				{host_parts.push( '' );}

				this.hash = matches[ 8 ] || this.hash;
				this.hostname = host_parts[ 0 ] || this.hostname;
				this.params = EndpointLocation.decodeSearchParameters( matches[ 6 ]);
				this.pathname = matches[ 5 ] || this.pathname;
				this.port = host_parts[ 1 ] || this.port;
				this.protocol = matches[ 1 ] || this.protocol;
				this.uriComponentDecoder = decodeURIComponent;
				this.uriComponentEncoder = encodeURIComponent;
			}
		}
	}
	/**
	 * @private
	 * @param {string} search - The search component of a parsed URL.
	 * @returns {Object} - A key/value hash object of the search component of a parsed URL.
	 */
	decodeSearchParameters( search )
	{
		const self = this;
		let params = ((search || '').match( EndpointLocation.SearchRegExp ) || [])
			.reduce( function split_url_parameter_and_decode( result, each, n, every )
			{
				let[ key, value ] = each.split( '=' )
					.map( self.uriComponentDecoder );
				//TODO try later
				// .map( function( part, p, pair )
				// {
				// 	let decoded = part;
				// 	if( typeof( part ) === 'string' )
				// 	{decoded = part.replace( /\+/g, ' ' );}
				// })
				result[ key ] = value;
				return( result );
			}, {});
		return( params );
	}
	/**
	 * @private
	 * @param {Object} object - A key/value hash object of the search component of a parsed URL.
	 * @returns {string} - The search component of a parsed URL.
	 */
	encodeSearchParameters( object )
	{
		const self = this;
		let encoded = Object.entries( object )
			.map( function encode_and_join_url_parameter( pair, p, pairs )
			{
				return( pair
					.map( self.uriComponentEncoder )
					//TODO try later
					// .map( function( part, p, pair )
					// {
					// 	let encoded = part;
					// 	if( typeof( part ) === 'string' )
					// 	{encoded = part.replace( / /g, '+' );}
					// })
					.join( '=' )
				);
			}, this )
			.join( '&' );
		return( encoded );
	}
	// reload(){}
	// replace( endpointLocation ){}
	/**
	 * @returns {string} - The href component of a serialized URL.
	 */
	toString()
	{
		let value = encodeURI( ''.concat( this.protocol, '//', this.host, this.pathname, this.search, this.hash ));
		return( value );
	}
	valueOf()
	{return( this );}
	/**
	 * @see https://gist.github.com/DavidWells/4543685
	 */
	static get SearchRegExp()
	{return( new RegExp( "([^?=&]+)(=([^&]*))?", 'g' ));}
	/**
	 * @see https://stackoverflow.com/a/26766402/1757334
	 */
	static get URLRegExp()
	{return( /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/ );}
}
// Using calculated properties because there values are inter-related.
Object.defineProperties( EndpointLocation.prototype,
{
	'host':
	{
		'enumerable':true,
		'get':function()
		{
			// Deep-copy like `String.prototype.slice`.
			let value = ''.concat( this.hostname );
			if( !!this.port )
			{value = value.concat( ':', this.port );}
			return( value );
		},
		'set':function( value )
		{
			let parts = (value || '').split( ':' );
			this.hostname = parts[ 0 ];
			if( parts.length > 1 )
			{this.port = parts[ 1 ];}
		},
	},
	'href':
	{
		'enumerable':true,
		'get':function()
		{return( this.toString());},
		'set':function( value )
		{this.assign( value );},
	},
	// 'search' is either empty string or start with '?'
	'search':
	{
		'enumerable':true,
		'get':function()
		{
			let value = '';
			if( Object.keys( this.params ).length > 0 )
			{value = '?'.concat( this.encodeSearchParameters( this.params ));}
			return( value );
		},
		'set':function( value )
		{
			if((typeof( value ) === 'string' || value instanceof String)
				&& (value === '' || value.startsWith( '?' ))
			)
			{this.params = this.decodeSearchParameters( value );}
			else
			{throw( new TypeError( "'search' must be an empty string or start with '?'." ));}
		},
	},
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
if( typeof( module ) !== 'undefined' ){module.exports = EndpointLocation;}
