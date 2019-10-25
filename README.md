# EndpointLocation
A URL manipulation utility similar to the familiar `Location` interface (in `window`).  The main difference is that `Location`'s API <sup id="browser_location-ref_1">[1](#browser_location)</sup> only accepts a URL string (and another `Location` object via `toString()`), but `EndpointLocation`'s API allows all that plus "construction by configuration" and empty construction for convenience.

```JavaScript
let clientEndpoint = new EndpointLocation(
{
	'hostname':'example.com',
	'pathname':'/'.concat( ['path', 'to', 'endpoint'].join( '/' )),
	'params':{'hash':'of', 'url':'parameters'},
	'protocol':'https:',
});
request.get(
	{
		'headers':
		{
			'Accept':'application/json',
			'User-Agent':'request',
		},
		// The convenience of `EndpointLocation`.
		'url':clientEndpoint.href,
		// "https://example.com/path/to/endpoint?hash=of&url=parameters"
	},
	function response_handler( error, httpResponse, responseText )
	{}
);
```
<b id="browser_location">1.</b> https://www.w3.org/TR/html50/browsers.html#the-location-interface
