/**
 * 
 */
package org.dojotoolkit;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.debug.DebugFrame;
import org.mozilla.javascript.debug.DebuggableScript;

/**
 * @author jkuhnert
 */
public class DojoDebugFrame implements DebugFrame {
	
	// private String _source;
	private int _currentLine;
	private Scriptable _currentActivation;
	private Scriptable _currentThis;
	private DebuggableScript _script;
	
	public DojoDebugFrame(String source, DebuggableScript script)
	{
		// _source = source; Don't store for now...
		_script = script;
	}
	
	/**
	 * Called when execution is ready to start bytecode interpretation for entered 
	 * a particular function or script.
	 *
	 * @param cx current Context for this thread
	 * @param activation the activation scope for the function or script.
	 * @param thisObj value of the JavaScript <code>this</code> object
	 * @param args the array of arguments
	 */
	public void onEnter(Context cx, Scriptable activation, Scriptable thisObj, Object[] args)
	{
		_currentActivation = activation;
		_currentThis = thisObj;
	}

	/**
	 * Called when thrown exception is handled by the function or script.
	 * 
	 * @param cx current Context for this thread
	 * @param ex exception object
	 */
	public void onExceptionThrown(Context cx, Throwable ex) 
	{
	}

	/**
	 * Called when the function or script for this frame is about to return.
	 * 
	 * @param cx current Context for this thread
	 * @param byThrow if true function will leave by throwing exception, otherwise it
	 *       will execute normal return
	 * @param resultOrException function result in case of normal return or
	 *       exception object if about to throw exception
	 */
	public void onExit(Context cx, boolean byThrow, Object resultOrException) 
	{
		if (byThrow && _script.getSourceName() != null && _script.getSourceName().indexOf("test_") > -1
				&& _script.getFunctionName() != null && _script.getFunctionName().length() > 0) {
			System.out.println("Error Source: " + _script.getSourceName() + "#" +_script.getFunctionName() 
					+ " : " + _currentLine);
		}
		
		_currentActivation = null;
		_currentThis = null;
	}

	/**
	 * Called when executed code reaches new line in the source.
	 * 
	 * @param cx current Context for this thread
	 * @param lineNumber current line number in the script source
	 */
	public void onLineChange(Context cx, int lineNumber) 
	{
		_currentLine = lineNumber;
	}

}
