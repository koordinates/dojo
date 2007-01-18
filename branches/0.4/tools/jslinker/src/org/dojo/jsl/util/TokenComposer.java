/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.util;

import java.util.*;
import java.util.regex.*;
import java.io.*;
import java.nio.*;
import java.nio.channels.*;
import java.nio.charset.*;

/**
 * 
 * 
 * @since JDK 1.4
 */
public final class TokenComposer extends Object {

	// Charset and decoder for ISO-8859-15
	static private Charset charset = Charset.forName("ISO-8859-15");

	static private CharsetDecoder decoder = charset.newDecoder();

	static private Pattern pattern = Pattern.compile(
			"(@\\w+@)|(<!-- @/?(\\w+)@ -->)", Pattern.MULTILINE
					| Pattern.DOTALL);

	/**
	 * Puts a backslash ("\") character in front of all characters that need to
	 * be "escaped" in JavaScript strings, so that they are not interpreted
	 * specially by the JavaScript interpreter.
	 * 
	 * Currently that set of characters is: \ -> \\ ' -> \' backspace -> \b
	 * form-feed -> \f newline -> \n Carriage return -> \r tab -> \t </script> ->
	 * \074/script> (because </script> is being treated as the termination of a
	 * string).
	 */
	static public String escapeSpecialCharacters(String baseString) {
		// NOTE: Adding this method did not seem to effect our
		// pages-per-second timing, so I don't think it's a problem.
		// If it does show up as a problem in future performance tests,
		// however, it can be implemented differently (e.g. with lookup
		// tables), though it will be harder to read/debug/add to.

		// \ -> \\
		baseString = baseString.replace("\\", "\\\\");
		// We now need to "escape" all quote ("'") characters and
		// some other characters, according to the JavaScript spec.
		// ' -> \'
		baseString = baseString.replace("'", "\\'");
		// backspace -> \b
		baseString = baseString.replace("\b", "\\b");
		// form-feed -> \f
		baseString = baseString.replace("\f", "\\f");
		// newline -> \n
		baseString = baseString.replace("\n", "\\n");
		// Carriage return -> \r
		baseString = baseString.replace("\r", "\\r");
		// tab -> \t
		baseString = baseString.replace("\t", "\\t");
		// < -> \074
		baseString = baseString.replace("<", "\\074");

		return baseString;
	}

	private LinkedList template;

	private String name;

	private TokenComposer parent;

	private Writer writer;

	private String freezeJsString;

	private Set tokenNames;

	private Set tokenBlockNames;

	static class Token {
		private String name;

		public Token(String name) {
			super();
			this.name = name;
		}

		public String getName() {
			return name;
		}

		@Override
		public String toString() {
			return "Token[" + name + "]";
		}
	}

	static public interface Delegate {
		public void processToken(TokenComposer composer, String tokenName)
				throws TokenComposerException;

		public void processTokenBlock(TokenComposer composer,
				TokenComposer minime) throws TokenComposerException;
	}

	public TokenComposer(TokenComposer mirror) {
		super();
		template = mirror.template;
		name = mirror.name;
		parent = mirror.parent;
		tokenNames = mirror.tokenNames;
		tokenBlockNames = mirror.tokenBlockNames;
	}

	private TokenComposer(String name, TokenComposer parent) {
		super();
		template = new LinkedList();
		this.name = name;
		this.parent = parent;
		tokenBlockNames = new HashSet();
		tokenNames = new HashSet();
	}

	public TokenComposer(CharSequence templateSequence)
			throws TokenComposerException {
		super();
		template = new LinkedList();
		tokenBlockNames = new HashSet();
		tokenNames = new HashSet();
		init(templateSequence);
	}

	public String getName() {
		return name;
	}

	public Set getTokenBlockNames() {
		return tokenBlockNames;
	}

	public Set getTokenNames() {
		return tokenNames;
	}

	public LinkedList getTemplate() {
		return template;
	}

	public CompiledTokenComposer compile(Class dataSourceClass)
			throws TokenComposerException {
		return TokenComposerCompiler.getSharedInstance().compile(this,
				dataSourceClass);
	}

	public void write(CharSequence aSequence) throws TokenComposerException {
		if (writer != null) {
			try {
				if (aSequence instanceof CharBuffer) {
					CharBuffer cb = (CharBuffer) aSequence;
					writer.write(cb.array(), cb.arrayOffset(), cb.length());
				} else if (aSequence instanceof String) {
					writer.write((String) aSequence);
				} else if (aSequence instanceof StringBuffer) {
					writer.write(aSequence.toString());
				} else {
					throw new TokenComposerException(
							"no way to write for this implementation of CharSequence "
									+ aSequence.getClass().getName());
				}
			} catch (IOException exc) {
				throw new TokenComposerException(exc);
			}
		} else if (parent != null) {
			parent.write(aSequence);
		} else {
			throw new TokenComposerException("nowhere to write");
		}
	}

	public void compose(Delegate delegate) throws TokenComposerException {
		this.compose(null, delegate);
	}

	void setWriter(Writer writer) {
		this.writer = writer;
	}

	public void compose(Writer writer, Delegate delegate)
			throws TokenComposerException {
		this.writer = writer;
		Iterator iter = template.iterator();

		while (iter.hasNext()) {
			Object element = iter.next();

			if (element instanceof CharSequence) {
				write((CharSequence) element);
			} else if (element instanceof Token) {
				delegate.processToken(this, ((Token) element).getName());
			} else {
				delegate.processTokenBlock(this, (TokenComposer) element);
			}
		}
		this.writer = null;
	}

	private void init(CharSequence templateSequence)
			throws TokenComposerException {
		Matcher matcher = TokenComposer.pattern.matcher(templateSequence);
		int cursor = 0;

		LinkedList composerStack = new LinkedList();
		composerStack.add(this);
		TokenComposer currentComposer = this;

		while (matcher.find()) {
			if (cursor < matcher.start()) {
				currentComposer.template.add(templateSequence.subSequence(
						cursor, matcher.start()));
			}

			String token = matcher.group(1);
			String tokenBlockMarker = matcher.group(2);
			String tokenBlockName = matcher.group(3);

			if (token != null) {
				token = token.substring(1, token.length() - 1);
				currentComposer.template.add(new Token(token));
				currentComposer.tokenNames.add(token);
			} else {
				if (tokenBlockMarker.startsWith("<!-- @/")) {
					if (composerStack.size() > 0) {
						currentComposer.tokenNames = Collections
								.unmodifiableSet(currentComposer.tokenNames);
						currentComposer.tokenBlockNames = Collections
								.unmodifiableSet(currentComposer.tokenBlockNames);
						currentComposer = (TokenComposer) composerStack
								.removeLast();
					} else {
						throw new TokenComposerException(
								"token block ended but not started");
					}
				} else {
					TokenComposer block = new TokenComposer(tokenBlockName,
							currentComposer);
					currentComposer.template.add(block);
					currentComposer.tokenBlockNames.add(tokenBlockName);

					composerStack.add(currentComposer);
					currentComposer = block;
				}
			}

			cursor = matcher.end();
		}

		if (currentComposer != this) {
			throw new TokenComposerException(
					"token block started but not ended");
		}

		if (cursor < templateSequence.length()) {
			currentComposer.template.add(templateSequence.subSequence(cursor,
					templateSequence.length()));
		}

		tokenNames = Collections.unmodifiableSet(tokenNames);
		tokenBlockNames = Collections.unmodifiableSet(tokenBlockNames);
	}

	private void indentDebugBuffer(StringBuffer buffer, int indent,
			boolean prependNewline) {
		if (prependNewline) {
			buffer.append('\n');
		}
		for (int i = 0; i < indent; i++) {
			buffer.append('\t');
		}
	}

	private void toDebugStringBuffer(StringBuffer buffer, int indentLevel) {
		buffer.append("TokenComposer[");
		if (name != null) {
			buffer.append(name);
		}
		buffer.append("]{");

		Iterator iter = template.iterator();

		while (iter.hasNext()) {
			Object element = iter.next();
			indentDebugBuffer(buffer, indentLevel + 1, true);

			if (element instanceof CharSequence) {
				buffer.append("static text [");
				CharSequence sequence = (CharSequence) element;
				buffer.append(sequence);
				buffer.append(']');
			} else if (element instanceof Token) {
				buffer.append(element.toString());
			} else {
				((TokenComposer) element).toDebugStringBuffer(buffer,
						indentLevel + 2);
			}
		}

		indentDebugBuffer(buffer, indentLevel, true);
		buffer.append('}');
	}

	@Override
	public String toString() {
		StringBuffer buffer = new StringBuffer();

		toDebugStringBuffer(buffer, 0);

		return buffer.toString();
	}

	/**
	 * Returns a freeze-dried state of the receiver (the parsing job) suitable
	 * for feeding into the constructor of CXContentComposer or the factory
	 * createFromFreezeDried in dig.composer on the client side. The return
	 * value is a string that can be used for token replacements and that is a
	 * javascript representation of the static data of the receiver (that means
	 * only the immutable data like token names, token block names and static
	 * text but not token values are considered).
	 * 
	 * @return String with the javascript
	 */
	public String getParsedDataAsJavascript() {
		if (freezeJsString == null) {
			IndentedStringBuffer indentBuffer = new IndentedStringBuffer();
			String escapedString;
			boolean isFirst = true;

			indentBuffer.println("[");
			indentBuffer.indent();

			Iterator iter = template.iterator();

			while (iter.hasNext()) {
				if (isFirst) {
					isFirst = false;
				} else {
					indentBuffer.println(",");
				}

				Object element = iter.next();

				if (element instanceof TokenComposer) {
					TokenComposer block = (TokenComposer) element;
					indentBuffer.println("{");
					indentBuffer.indent();
					indentBuffer.print("'tokenName':");
					escapedString = escapeSpecialCharacters(block.getName());
					indentBuffer.print("'");
					indentBuffer.print(escapedString);
					indentBuffer.print("'");
					indentBuffer.println(",");
					indentBuffer.println("'tokenType':2,");
					indentBuffer.print("'tokenBlockContents':");
					indentBuffer.print(block.getParsedDataAsJavascript());
					indentBuffer.println("");
					indentBuffer.outdent();
					indentBuffer.print("}");
				} else if (element instanceof Token) {
					Token token = (Token) element;
					indentBuffer.println("{");
					indentBuffer.indent();
					indentBuffer.print("'tokenName':");
					escapedString = escapeSpecialCharacters(token.getName());
					indentBuffer.print("'");
					indentBuffer.print(escapedString);
					indentBuffer.print("'");
					indentBuffer.println(",");
					indentBuffer.println("'tokenType':1");
					indentBuffer.outdent();
					indentBuffer.print("}");
				} else {
					if (element instanceof String) {
						escapedString = (String) element;
					} else {
						escapedString = ((CharSequence) element).toString();
					}

					escapedString = escapeSpecialCharacters(escapedString);
					indentBuffer.print("'");
					indentBuffer.print(escapedString);
					indentBuffer.print("'");
				}
			}

			indentBuffer.println("");
			indentBuffer.outdent();
			indentBuffer.print("]");

			freezeJsString = indentBuffer.toString();
		}

		return freezeJsString;
	}

	// testing
	static public void main(String[] args) {
		FileInputStream fis = null;
		FileChannel fc = null;

		if (args.length != 1) {
			System.out.println("specify a filename");
			System.exit(-1);
		}

		try {
			// Open the file and then get a channel from the stream
			fis = new FileInputStream(args[0]);
			fc = fis.getChannel();

			// Get the file's size and then map it into memory
			int sz = (int) fc.size();
			MappedByteBuffer bb = fc.map(FileChannel.MapMode.READ_ONLY, 0, sz);

			// Decode the file into a char buffer
			CharBuffer cb = decoder.decode(bb);

			TokenComposer composer = new TokenComposer(cb);

			System.out
					.println("-----------------------------------------------------------");
			System.out.println("composer = " + composer);
			System.out
					.println("-----------------------------------------------------------");
			System.out.println("freeze dried js string = "
					+ composer.getParsedDataAsJavascript());

			// comment this out if you're tokens are not Foo and Bar and the
			// token block is Tar
			CompiledTokenComposer compiled = composer
					.compile(DataSourceExample.class);

			Writer writer = new OutputStreamWriter(System.out);

			compiled.compose(writer, new DataSourceExample());

			writer.flush();

		} catch (IOException exc) {
			exc.printStackTrace();
		} catch (TokenComposerException exc) {
			exc.printStackTrace();
		} finally {
			// Close the channel and the stream
			try {
				if (fc != null) {
					fc.close();
				} else if (fis != null) {
					fis.close();
				}
			} catch (IOException exc) {
			}
		}
	}

	static public TokenComposer loadComposer(String aTemplatePath)
			throws TokenComposerException, IOException {
		TokenComposer composer = null;

		FileInputStream fis = null;
		FileChannel fc = null;

		try {
			// Open the file and then get a channel from the stream
			fis = new FileInputStream(aTemplatePath);

			fc = fis.getChannel();

			// Get the file's size and then map it into memory
			int sz = (int) fc.size();
			MappedByteBuffer bb = fc.map(FileChannel.MapMode.READ_ONLY, 0, sz);

			// Decode the file into a char buffer
			CharBuffer cb = decoder.decode(bb);

			composer = new TokenComposer(cb);
		} finally {
			// Close the channel and the stream
			try {
				if (fc != null) {
					fc.close();
				} else if (fis != null) {
					fis.close();
				}
			} catch (IOException exc) {
			}
		}

		return composer;
	}

	static public void freezeDry(File srcFile, File dstFile)
			throws TokenComposerException, IOException {
		FileInputStream fis = null;
		FileChannel fc = null;

		TokenComposer composer = null;

		try {
			// Open the file and then get a channel from the stream
			fis = new FileInputStream(srcFile);
			fc = fis.getChannel();

			// Get the file's size and then map it into memory
			int sz = (int) fc.size();
			MappedByteBuffer bb = fc.map(FileChannel.MapMode.READ_ONLY, 0, sz);

			// Decode the file into a char buffer
			CharBuffer cb = decoder.decode(bb);

			composer = new TokenComposer(cb);

		} finally {
			// Close the channel and the stream
			try {
				if (fc != null) {
					fc.close();
				} else if (fis != null) {
					fis.close();
				}
			} catch (IOException exc) {
			}
		}

		String freezeDriedJS = composer.getParsedDataAsJavascript();

		FileOutputStream fos = null;
		FileChannel ofc = null;

		try {
			fos = new FileOutputStream(dstFile);
			ofc = fos.getChannel();

			byte[] buffer = freezeDriedJS.getBytes("ISO-8859-15");
			ByteBuffer byteBuffer = ByteBuffer.wrap(buffer);

			ofc.write(byteBuffer);
		} finally {
			try {
				if (ofc != null) {
					ofc.close();
				} else if (fos != null) {
					fos.close();
				}
			} catch (IOException exc) {
			}
		}
	}

}
