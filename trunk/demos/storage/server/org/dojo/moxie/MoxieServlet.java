package org.dojo.moxie;

import java.io.*;
import java.net.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;

/** 
	Exposes a simple RESTian API for working with Moxie documents.
	The objects we expose are Moxie documents with their filenames:
	
	/somePageName1
	/somePageName2
	
	etc.
	
	To view a page, simply do a GET on it's page name. If a page
	does not exist you will get a 404 (Not Found); if it is an incorrect filename
	you will get a 403 (Forbidden).
	
	To see a list of all page's, simply do a GET on /* - 
	This will return a simple HTML page that uses an unordered list
	of links to point to all of our pages:
	
	<html><body>
		<ul>
			<li><a href="somePageName1">somePageName1</a></li>
			<li><a href="somePageName2">somePageName2</a></li>
		</ul>
	</body></html>
	
	To create a new page, do a POST to what the page name will be,
	such as /aNewPage1. The payload should simply be the HTML
	for this new page. The server responds with either a 201 (Created) or
	403 (Forbidden) if the page already exists or has a malformed name.
	
	To update a page, we need to simulate a PUT request to the / URL
	of the page name, such as /updateMe1. Safari and Opera don't support
	PUT requests, so we simulate this with a POST request with the custom
	header 'X-Method-Override: PUT'. Send the payload of the page's new
	content. Server returns 404 (Not Found) if not found; 403 (Forbidden)
	if you gave a mangled file name; or 200 OK if the update was
	successful.
	
	To delete a page, we need to simulate a DELETE request to the / URL
	of the page name. Safari and Opera have the same issues here,
	so we use 'X-Method-Override: DELETE' on these. The server 
	returns a 410 (Gone) request if successful,
	404 (Not Found) if there was no page there originally, or
	403 (Not Allowed) if the file name is mangled.
	
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class MoxieServlet extends HttpServlet{
	public void init() throws ServletException {
		// get our JDBC connection information
		String jdbcURL = getServletConfig().getInitParameter("jdbcURL");
		String userName = getServletConfig().getInitParameter("userName");
		String password = getServletConfig().getInitParameter("password");
		String driver = getServletConfig().getInitParameter("driver");
		
		// initialize our database and the class that allows us to 
		// gain access to our documents
		try{
			Documents.initialize(jdbcURL, userName, password, driver);
		}catch(MoxieException e){
			throw new ServletException(e);
		}
	}
	
	public void doGet(HttpServletRequest req, HttpServletResponse res)
							throws IOException, ServletException{
		try{
			String path = req.getPathInfo();
			
			// dispatch our action
			if(path.equals("/*")){
				list(req, res);
			}else{
				viewItem(req, res);
			}
		}catch(MoxieException e){
			throw new ServletException(e);
		}
	}
	
	public void doPost(HttpServletRequest req, HttpServletResponse res)
							throws IOException, ServletException{
		try{
			String methodOverride = req.getHeader("X-Method-Override");
			
			// dispatch our action
			if(methodOverride == null){
				newItem(req, res);
			}else if(methodOverride.equals("PUT")){
				updateItem(req, res);
			}else if(methodOverride.equals("DELETE")){
				deleteItem(req, res);
			}
		}catch(MoxieException e){
			throw new ServletException(e);
		}
	}
	
	private void viewItem(HttpServletRequest req, HttpServletResponse res)
							throws IOException, ServletException, MoxieException{
		// get the file name
		String fileName = getFileName(req, res);
	
		// white list the file name
		if(Document.validFileName(fileName) == false){ // invalid file name
			// HTTP Status Code 403
			res.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}
	
		// see if the file exists
		if(Documents.exists(fileName) == false){
			// HTTP Status Code 404
			res.sendError(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		
		// try to get it
		Document doc = Documents.findByFileName(fileName);
		res.setContentType("text/html");
		PrintWriter out = res.getWriter();
		out.write(doc.content);
	}
	
	private void newItem(HttpServletRequest req, HttpServletResponse res)
							throws IOException, ServletException, MoxieException{
		// get the file name
		String fileName = getFileName(req, res);
	
		// white list the file name
		if(Document.validFileName(fileName) == false){ // invalid file name
			// HTTP Status Code 403
			res.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}
	
		// see if the file exists
		if(Documents.exists(fileName) == true){
			// HTTP Status Code 404
			res.sendError(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		
		// populate it's Document values
		String content = getRequestAsString(req);
		Document doc = new Document(null, fileName, new Date(), new Date(),
									content);
									
		// create it
		Documents.newItem(doc);
		
		// send back a 201 Created response with the correct
		// return values
		res.setStatus(HttpServletResponse.SC_CREATED);
		res.setHeader("Location", fileName);
		res.setContentType("text/html");
	}
	
	private void deleteItem(HttpServletRequest req, HttpServletResponse res)
							throws IOException, ServletException, MoxieException{
		// get the file name
		String fileName = getFileName(req, res);
	
		// white list the file name
		if(Document.validFileName(fileName) == false){ // invalid file name
			// HTTP Status Code 403
			res.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}
	
		// see if the file exists
		if(Documents.exists(fileName) == false){
			// HTTP Status Code 404
			res.sendError(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		
		// get the original document
		Document doc = Documents.findByFileName(fileName);
		
		// delete it
		Documents.deleteItem(doc.id);
		
		// send back a 410 Gone response
		res.setStatus(HttpServletResponse.SC_GONE);
	}
	
	private void updateItem(HttpServletRequest req, HttpServletResponse res)
							throws IOException, ServletException, MoxieException{
		// get the file name
		String fileName = getFileName(req, res);
	
		// white list the file name
		if(Document.validFileName(fileName) == false){ // invalid file name
			// HTTP Status Code 403
			res.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}
	
		// see if the file exists
		if(Documents.exists(fileName) == false){
			// HTTP Status Code 404
			res.sendError(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		
		// get the original document
		Document doc = Documents.findByFileName(fileName);
		
		// get our new content
		String content = getRequestAsString(req);							
																							
		// update our values
		doc.lastUpdated = new Date();
		doc.content = content;
		
		// save them
		Documents.updateItem(doc);
		
		// send back a 200 OK response with the correct
		// return values
		res.setStatus(HttpServletResponse.SC_OK);
	}
	
	private void list(HttpServletRequest req, HttpServletResponse res)
							throws IOException, ServletException, MoxieException{
		// get our file names
		List<Document> allDocs = Documents.list();
		
		// loop through each one and write it out as an A tag
		res.setContentType("text/html");
		PrintWriter out = res.getWriter();
		out.write("<html><body><ul>");
		Iterator<Document> iter = allDocs.iterator();
		while(iter.hasNext()){
			Document d = iter.next();
			out.write("<li><a href=\"" + d.fileName + "\">"
						+ d.fileName + "</a></li>");
		}
		out.write("</ul></body></html>");
	}
	
	private String getFileName(HttpServletRequest req, HttpServletResponse res) 
										throws MoxieException{
		// get the file to view
		String fileName = req.getPathInfo();
		
		// strip off the leading slash
		fileName = fileName.substring(1);
		
		return fileName;
	}
	
	private String getRequestAsString(HttpServletRequest req) 
                                          throws IOException{
		// FIXME: WARNING: The combination of a wrapped InputStream being
		// treated as a reader, with the deprecated readLine() method below
		// might mangle i18n text
		BufferedReader requestData = new BufferedReader(
					  new InputStreamReader(req.getInputStream()));
		StringBuffer stringBuffer = new StringBuffer();
		String line;
		while ((line = requestData.readLine()) != null){
			stringBuffer.append(line);
		}
		return stringBuffer.toString();
   }
}