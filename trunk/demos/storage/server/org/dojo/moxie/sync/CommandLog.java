package org.moxie.sync;

import java.util.*;
import java.io.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class CommandLog 
				extends java.util.ArrayList<Command> 
				implements java.io.Serializable{
	public void replay() throws SyncException{
	}
}