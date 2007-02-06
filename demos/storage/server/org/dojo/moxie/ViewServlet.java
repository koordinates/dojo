package org.dojo.moxie;

import java.io.*;
import java.net.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class ViewServlet extends HttpServlet{
	public void init() throws ServletException {
		System.out.println("ViewServlet.init called!");
		
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
		// get the file to view
		String fileName = req.getPathInfo();
		
		// strip off the leading slash
		fileName = fileName.substring(1);
		
		// if it's a wildcard return our list of file names
		if(fileName.equals("*")){
			try{
				// get our file names
				List<Document> allDocs = Documents.list();
				
				// loop through each one and write it out as an A tag
				res.setContentType("text/html");
				PrintWriter out = res.getWriter();
				out.write("<html><body>");
				Iterator<Document> iter = allDocs.iterator();
				while(iter.hasNext()){
					Document d = iter.next();
					out.write("<p><a href=\"" + d.fileName + "\">"
								+ d.fileName + "</a></p>");
				}
				out.write("</body></html>");
				return;
			}catch(MoxieException e){
				throw new ServletException(e);
			}
		}
		
		// white list the file name
		if(Document.validFileName(fileName) == false){ // invalid file name
			// HTTP Status Code 403
			res.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}
		
		try{
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
		}catch(MoxieException e){
			throw new ServletException(e);
		}
	}
}