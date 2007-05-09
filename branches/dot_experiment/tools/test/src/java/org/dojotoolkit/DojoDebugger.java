/**
 * 
 */
package org.dojotoolkit;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.debug.DebugFrame;
import org.mozilla.javascript.debug.DebuggableScript;
import org.mozilla.javascript.debug.Debugger;

import java.util.Map;
import java.util.WeakHashMap;

/**
 * @author jkuhnert
 *
 */
public class DojoDebugger implements Debugger {
	
	private Map _data = new WeakHashMap();
	
	/**
	 * {@inheritDoc}
	 */
	public DebugFrame getFrame(Context cx, DebuggableScript script)
	{
		return (DojoDebugFrame)_data.get(script);
	}

	/**
	 * {@inheritDoc}
	 */
	public void handleCompilationDone(Context cx, DebuggableScript script, String source) 
	{
		_data.put(script, new DojoDebugFrame(source, script));
	}

}
