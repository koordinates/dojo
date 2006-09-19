package org.dojotoolkit;

import java.net.URI;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Implementation of a Cookie to help IO operations in unit tests requiring
 * session operations.
 * 
 * @author jkuhnert
 */
public class Cookie {

	String _name;
	String _value;
	URI _uri;
	String _domain;
	Date _expires;
	String _path;

	private static DateFormat EXPIRE_FORMAT_1 = new SimpleDateFormat(
			"E, dd MMM yyyy k:m:s 'GMT'", Locale.US);

	private static DateFormat EXPIRES_FORMAT_2 = new SimpleDateFormat(
			"E, dd-MMM-yyyy k:m:s 'GMT'", Locale.US);
	
	public Cookie(URI uri, String name, String value, 
			String expires, String path, String domain)
	{
		_uri = uri;
		_name = name;
		_value = value;
		
		if (expires != null) {
			try {
				_expires = EXPIRE_FORMAT_1.parse(expires);
			} catch (ParseException e) {
				try {
					_expires = EXPIRES_FORMAT_2.parse(expires);
				} catch (ParseException e2) {
					throw new IllegalArgumentException(
							"Bad date format in header: " + expires);
				}
			}
		}
		
		_path = path;
		_domain = domain;
	}
	
	/**
	 * Construct a cookie from the URI and header fields
	 * 
	 * @param uri
	 *            URI for cookie
	 * @param header
	 *            Set of attributes in header
	 */
	public Cookie(URI uri, String header) {
		String attributes[] = header.split(";");
		String nameValue = attributes[0].trim();
		this._uri = uri;
		this._name = nameValue.substring(0, nameValue.indexOf('='));
		this._value = nameValue.substring(nameValue.indexOf('=') + 1);
		this._path = "/";
		this._domain = uri.getHost();

		for (int i = 1; i < attributes.length; i++) {
			nameValue = attributes[i].trim();
			int equals = nameValue.indexOf('=');
			if (equals == -1) {
				continue;
			}
			String name = nameValue.substring(0, equals);
			String value = nameValue.substring(equals + 1);
			if (name.equalsIgnoreCase("domain")) {
				String uriDomain = uri.getHost();
				if (uriDomain.equals(value)) {
					this._domain = value;
				} else {
					if (!value.startsWith(".")) {
						value = "." + value;
					}
					uriDomain = uriDomain.substring(uriDomain.indexOf('.'));
					if (!uriDomain.equals(value)) {
						throw new IllegalArgumentException(
								"Trying to set foreign cookie");
					}
					this._domain = value;
				}
			} else if (name.equalsIgnoreCase("path")) {
				this._path = value;
			} else if (name.equalsIgnoreCase("expires")) {
				try {
					this._expires = EXPIRE_FORMAT_1.parse(value);
				} catch (ParseException e) {
					try {
						this._expires = EXPIRES_FORMAT_2.parse(value);
					} catch (ParseException e2) {
						throw new IllegalArgumentException(
								"Bad date format in header: " + value);
					}
				}
			}
		}
	}

	public boolean hasExpired() {
		if (_expires == null) {
			return false;
		}
		Date now = new Date();
		return now.after(_expires);
	}

	public String getName() {
		return _name;
	}

	public URI getURI() {
		return _uri;
	}

	/**
	 * Check if cookie isn't expired and if URI matches, should cookie be
	 * included in response.
	 * 
	 * @param uri
	 *            URI to check against
	 * @return true if match, false otherwise
	 */
	public boolean matches(URI uri) {

		if (hasExpired()) {
			return false;
		}

		String path = uri.getPath();
		if (path == null) {
			path = "/";
		}

		return path.startsWith(this._path);
	}

	public String toString() {
		StringBuilder result = new StringBuilder(_name);
		result.append("=");
		result.append(_value);
		return result.toString();
	}
}
