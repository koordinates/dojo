import org.mozilla.javascript.tools.shell.Global;
//import org.mozilla.javascript.tools.shell.Main;
import org.mozilla.javascript.tools.ToolErrorReporter;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Parser;
import org.mozilla.javascript.IRFactory;
import org.mozilla.javascript.Interpreter;
import org.mozilla.javascript.TokenStream;
import org.mozilla.javascript.ScriptOrFnNode;
import org.mozilla.javascript.Script;
import org.mozilla.javascript.ScriptableObject;

import java.io.Reader;
import java.io.FileReader;
import java.util.List;

/*

Invoke Rhino decompiler to format code in each file.

Will break lines, and put in {} for "if" and "for"
Excludes comments.

*/

public class JsLinker {
    // see org.mozilla.javascript.tools.shell.Main.main
    // see org.mozilla.javascript.ScriptRuntime.main

    /*
    public static void main2(String args[]) {
        Context cx = Main.enterContext();
	Global global = Main.getGlobal();
	Main.processOptions(cx, args);
    }
    */

    static Context enterContext() {
        Context cx = new Context();
        return Context.enter(cx);
    }

    // See Context.java compileReader and compile
    // this does parse without compilation, to get a tree
    public static ScriptOrFnNode myparse(Context cx, Scriptable scope, Reader in, String sourceName, int lineno, Object securityDomain) throws java.io.IOException {
	//cx.setErrorReporter(...)
	// see Context.createCompiler
	Interpreter compiler = new Interpreter();
	TokenStream ts = new TokenStream(in, null, scope, sourceName, lineno);
	// see Context.createparser
	Parser p = new Parser();
	p.setLanguageVersion(Context.VERSION_1_5);
	IRFactory irf = compiler.createIRFactory(cx, ts);
	ScriptOrFnNode tree = p.parse(ts, irf); // IOException
	tree = compiler.transform(cx, irf, tree);

	if (true) {
	    System.out.println("// toStringTree for " + sourceName);
	    Context.setPrintTrees(true);
	    System.out.println(tree.toStringTree(tree));
	}

        Script result = (Script)compiler.compile(cx, scope, tree, null /*securityController*/, securityDomain);

	return tree;
    }

    public static void main(String args[]) throws java.io.FileNotFoundException, java.io.IOException {
	Context cx = enterContext();
	Global global = new Global(enterContext());
        ToolErrorReporter errorReporter = new ToolErrorReporter(false, global.getErr());
	// instance of org.mozilla.javascript.ErrorReporter
	cx.setErrorReporter(errorReporter);

	List fileList = new java.util.ArrayList();
    	for (int i=0; i < args.length; i++) {
            String arg = args[i];
	    fileList.add(arg);
        }

	Object[] array = args;
        Scriptable argsObj = cx.newArray(global, args);
        global.defineProperty("arguments", argsObj,
                              ScriptableObject.DONTENUM);

        for (int i=0; i < fileList.size(); i++) {
            //Main.processFile(cx, global, (String) fileList.get(i));
	    String filename = (String) fileList.get(i);
	    Reader in = new FileReader(filename); // FileNotFoundException

	    System.out.println("// compiling " + filename);
	    Script script = cx.compileReader(global, in, filename, 1, null); // IOException

	    System.out.println("// decompiling " + filename);
	    // determines initial indent on all lines. relative indent is fixed at 4.
	    int indent = 0;
	    String dec = cx.decompileScript(script, global, indent);
	    System.out.println(dec);
	    if (false) {
		// see NativeFunction.java compile().
		// it in turn calls Parser.decompile.
		// note that getSourcesTree() is protected, uses org/mozilla/javascript/optimizer/Codegen getSourcesTreeImpl
		String dec2 = ((org.mozilla.javascript.NativeFunction)script).decompile(cx, indent, false);
		//Parser.decompile(script.getSourcesTree(), false, Context.VERSION_1_3, indent, false);
		if (!dec.equals(dec2)) {
		    System.out.println("differs from:\n" + dec2);
		}
	    }

	    System.out.println("// parsing " + filename);
	    ScriptOrFnNode tree = myparse(cx, global, in, filename, 1, null); 
        }

        cx.exit();
        return;
    }


}
