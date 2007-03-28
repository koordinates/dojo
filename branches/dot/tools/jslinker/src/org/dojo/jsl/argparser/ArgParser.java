package org.dojo.jsl.argparser;

import java.util.HashMap;

public class ArgParser {
	public static final HashMap parse(String[] args, HashMap argMaps, HashMap noArgValues) {
		HashMap parsedArgs = new HashMap();
		String argName = null;
		for (int i = 0; i < args.length; i++) {
			//Get the arg name.
			argName = removeDashes(args[i]);
			
			//See if it is an alias for something else.
			if (argMaps.get(argName) != null) {
				argName = (String)argMaps.get(argName);
			}
			
			//Find out if it is no-value arg. If it should
			//have a value, get the value.
			String value = "true";
			if (noArgValues.get(argName) == null) {
				//Increment to find the next argument.
				value = args[++i];

				//Make sure it is not an arg name.
				if (isArgName(value)) {
					throw new IllegalArgumentException("Argument: " + args[i - 1] + " requires a value.");
				}
			}
			
			//Add it to the result.
			parsedArgs.put(argName, value);
		}
		
		return parsedArgs;
	}

	private final static String removeDashes(String arg) {
		int startIndex = 0;
		if (arg.charAt(0) == '-') {
			if (arg.charAt(1) == '-') {
				startIndex = 2;
			} else {
				startIndex = 1;
			}
		}
		return arg.substring(startIndex, arg.length());
	}

	private final static boolean isArgName(String arg) {
		return (arg.charAt(0) == '-');
	}
}
