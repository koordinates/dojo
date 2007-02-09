package org.dojo.moxie.sync;

import java.io.*;
import java.net.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class SyncServlet extends HttpServlet{
	public void doPost(HttpServletRequest req, HttpServletResponse res)
							throws IOException, ServletException{
			String responseContent = getRequestBody(req);
			
			// send this to the client
			String returnContent = "{responseContent: '" + responseContent + "'}";
			sendResponseBody(returnContent, res);
	}
	
	private String getRequestBody(HttpServletRequest req) 
                                          throws IOException{
		// correctly decode this value
		String contentType = req.getHeader("Content-Type");
		if(contentType != null && contentType.equals("text/javascript")){
			// basic JavaScript in POST payload
			
			BufferedReader requestData = new BufferedReader(
						  new InputStreamReader(req.getInputStream()));
			StringBuffer stringBuffer = new StringBuffer();
			String line;
			while ((line = requestData.readLine()) != null){
				stringBuffer.append(line);
			}
			
			String content = stringBuffer.toString();
			return content;
		}else{ // encoded form values -- application/x-www-form-urlencoded
			String content = req.getParameter("content");
			
			return content;
		}
	}
	
	private void sendResponseBody(String content, HttpServletResponse res)
											throws IOException, ServletException{											
		res.setContentType("text/javascript");
		res.setStatus(HttpServletResponse.SC_OK);
		PrintWriter out = res.getWriter();
		out.write(content);
	}
}

