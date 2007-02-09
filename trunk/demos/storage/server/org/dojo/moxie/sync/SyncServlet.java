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
			try{
				System.out.println("1");
				// get our JSON payload from the client
				String responseContent = getRequestBody(req);
				System.out.println("2");
				System.out.println("json before="+responseContent);
				// turn this into a sync request so we can work with it
				SyncRequest syncReq = SyncRequest.fromJSON(responseContent);
				System.out.println("3");
				// actually perform the syncing using the request log and
				// generating a response log
				/*Syncer syncer = new Syncer(syncReq);
				syncer.doSync();
				
				// get our sync response with our sync results
				SyncResponse syncRes = syncer.getSyncResponse();
				
				// transform this into JSON to send to the client
				String returnContent = syncRes.toJSON();*/
				
				// send this to the client
				sendResponseBody("hello world", res);
			}catch(Exception e){
				e.printStackTrace();
				throw new ServletException(e);
			}
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

