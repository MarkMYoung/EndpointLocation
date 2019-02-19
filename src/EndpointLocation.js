'use strict';
/**
 * @description A URL manipulation utility similar to the familiar `Location` 
 *	interface (in `window`).  The main difference is that 
 *	`Location`'s API only accepts a URL string (and another `Location` object 
 *	via `toString()`), but `EndpointLocation`'s API allows all that plus 
 *	"construction by configuration" and empty construction for convenience.
 * @version 1.0.0 (2018-12-28)
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
 */
class EndpointLocation// extends Location
{
	constructor( endpointLocation )
	{
		let hidden =
		{
			'hash':'',
			'pathname':'/',
			'port':'',
			'protocol':'https:',
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
		});
		this.hash = '';
		// 'host' is defined as a calculated property.
		this.hostname = '';
		// 'href' is defined as a calculated property.
		this.params = {};
		this.pathname = '/';
		this.port = '';
		this.protocol = 'https:';
		// 'search' is defined as a calculated property.
		if( !!endpointLocation )
		{this.assign( endpointLocation );}
	}
	assign( endpointLocation )
	{
		if( typeof( endpointLocation ) === 'object' && endpointLocation !== null )
		{
			this.hash = endpointLocation.hash || this.hash;
			this.hostname = endpointLocation.hostname || this.hostname;
			this.pathname = endpointLocation.pathname || this.pathname;
			this.port = endpointLocation.port || this.port;
			this.protocol = endpointLocation.protocol || this.protocol;
			this.params = endpointLocation.params
				|| EndpointLocation.locationSearchToParameterObject( endpointLocation.search )
				|| this.params;
		}
		else if( typeof( endpointLocation ) === 'string' )
		{
			const matches = endpointLocation.match( EndpointLocation.URLRegExp ) || [];
			if( matches.length == 10 )
			{
				this.hash = matches[ 8 ] || this.hash;
				this.pathname = matches[ 5 ] || this.pathname;
				this.protocol = matches[ 1 ] || this.protocol;
				this.params = EndpointLocation.locationSearchToParameterObject( matches[ 6 ]);

				let host_parts = (matches[ 4 ] || '').split( ':' );
				if( host_parts.length < 2 )
				{host_parts.push( '' );}
				this.hostname = host_parts[ 0 ] || this.hostname;
				this.port = host_parts[ 1 ] || this.port;
			}
		}
	}
	// reload(){}
	// replace( endpointLocation ){}
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
	static locationSearchToParameterObject( search )
	{
		let params = ((search || '').match( EndpointLocation.SearchRegExp ) || [])
			.reduce( function split_url_parameter_and_decode( result, each, n, every )
			{
				let[ key, value ] = each.split( '=' );
				// .map( decodeURIComponent )
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
	static wwwFormUrlEncodeObject( object )
	{
		let encoded = Object.entries( object )
			.map( function encode_and_join_url_parameter( pair, p, pairs )
			{
				return( pair
					// .map( encodeURIComponent )
					//TODO try later
					// .map( function( part, p, pair )
					// {
					// 	let encoded = part;
					// 	if( typeof( part ) === 'string' )
					// 	{encoded = part.replace( / /g, '+' );}
					// })
					.join( '=' )
				);
			})
			.join( '&' );
		return( encoded );
	}
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
			{value = '?'.concat( EndpointLocation.wwwFormUrlEncodeObject( this.params ));}
			return( value );
		},
		'set':function( value )
		{
			if((typeof( value ) === 'string' || value instanceof String)
				&& (value === '' || value.startsWith( '?' ))
			)
			{this.params = EndpointLocation.locationSearchToParameterObject( value );}
			else
			{throw( new TypeError( "'search' must be an empty string or start with '?'." ));}
		},
	},
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
if( typeof( module ) !== 'undefined' ){module.exports = EndpointLocation;}
