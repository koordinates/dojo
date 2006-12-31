<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:saxon="http://saxon.sf.net/" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0">
<xsl:output method="text" indent="yes"/>
<xsl:strip-space elements="*"/> 
    
<xsl:template match="/">
     <xsl:apply-templates/>
</xsl:template>
  
<!-- process ldml,dates,calendars-->
<xsl:template name="top" match="/ldml">
    <xsl:choose>
        <xsl:when test="count(./alias)>0">
            <!-- Handle Alias -->
            <xsl:for-each select="./alias">
                <xsl:call-template name="alias_template">
                    <xsl:with-param name="templateToCall">top</xsl:with-param>
                    <xsl:with-param name="source" select="@source"></xsl:with-param>
                    <xsl:with-param name="xpath" select="@path"></xsl:with-param>
                </xsl:call-template>     
                </xsl:for-each>
        </xsl:when>
        <xsl:otherwise>
            <xsl:choose>
                <xsl:when test="name()='calendars'">
                    <!-- calendars -->
                    <xsl:for-each select="calendar">       
                        <xsl:result-document href="{concat(@type,'.js')}" encoding="UTF-8">({            
        //calendar type = <xsl:value-of select="./@type"/>
                           <xsl:call-template name="calendar"></xsl:call-template>

})
                        </xsl:result-document>
                    </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>                    
                    <xsl:if test="name()='ldml'">
                        <!-- ldml -->
                        <xsl:for-each select="dates">
                            <xsl:call-template name="top"></xsl:call-template>
                        </xsl:for-each>
                    </xsl:if>
                    <xsl:if test="name()='dates'">
                        <!-- dates -->
                        <xsl:for-each select="calendars">
                            <xsl:call-template name="top"></xsl:call-template>
                        </xsl:for-each>
                    </xsl:if>                 
                </xsl:otherwise>
            </xsl:choose>
         </xsl:otherwise>
    </xsl:choose>        
</xsl:template>

    <!-- process calendar-->
<xsl:template name="calendar" match="calendar">
    <xsl:choose>
        <xsl:when test="count(./alias)>0">
            <!-- Handle Alias -->
            <xsl:for-each select="./alias">
                <xsl:call-template name="alias_template">
                    <xsl:with-param name="templateToCall">calendar</xsl:with-param>
                    <xsl:with-param name="source" select="@source"></xsl:with-param>
                    <xsl:with-param name="xpath" select="@path"></xsl:with-param>
                </xsl:call-template>     
            </xsl:for-each>
        </xsl:when>
        <xsl:otherwise>
            <xsl:apply-templates/>
        </xsl:otherwise>
    </xsl:choose>
</xsl:template>
    
<!-- process months -->
    <xsl:template name="months_days_quarters" match="months | days | quarters">
    <xsl:param name="width" select="@type"/>
    <xsl:variable name="ctx" select="../@type"/>
    <xsl:choose>       
        <xsl:when test="count(./alias)>0">
            <!-- Handle Alias -->
            <xsl:for-each select="./alias">
                <xsl:call-template name="alias_template">
                    <xsl:with-param name="templateToCall">months_days_quarters</xsl:with-param>
                    <xsl:with-param name="source" select="@source"></xsl:with-param>
                    <xsl:with-param name="xpath" select="@path"></xsl:with-param>
                </xsl:call-template>
            </xsl:for-each>            
        </xsl:when>
        <xsl:otherwise>
            <xsl:if test="name()='months' or name()='monthContext'
                       or name()='days' or name()='dayContext'
                       or name()='quarters' or name()='quarterContext'">
                <xsl:if test="contains(name(),'s') and count(./alias)=0">
                <xsl:text>
                </xsl:text>
                </xsl:if>
                <xsl:for-each select="*">
                    <xsl:call-template name="months_days_quarters"></xsl:call-template>
                </xsl:for-each>
            </xsl:if>
            <xsl:if test="name()='monthWidth' or name()='dayWidth'">
                <xsl:variable name="item" select="substring-before(name(), 'Width')"/>
                <xsl:if test="count(*[not(@draft)])>0 or count(*[@draft!='provisional' and @draft!='unconfirmed'])>0"> 
        '<xsl:value-of select="$item"/>
                <xsl:text>s-</xsl:text>
                <xsl:call-template name="camel_case">
                    <xsl:with-param name="name"><xsl:value-of select="$ctx"></xsl:value-of></xsl:with-param>
                </xsl:call-template>
                <xsl:choose>
                	<xsl:when test="$width='abbreviated'"><xsl:text>-abbr</xsl:text></xsl:when>
                	<xsl:otherwise>
                       <xsl:value-of select="concat('-',$width)"></xsl:value-of>
                    </xsl:otherwise>
                </xsl:choose>
                <xsl:text>':</xsl:text>
                <xsl:call-template name="subSelect"><xsl:with-param name="name" select="./*[name()=$item]"></xsl:with-param></xsl:call-template>
                <xsl:text>
</xsl:text>
                </xsl:if>
                </xsl:if>
            <xsl:if test="name()='quarterWidth'">
             <xsl:if test="count(*[not(@draft)])>0 or count(*[@draft!='provisional' and @draft!='unconfirmed'])>0"> 
        'quarters-<xsl:value-of select="concat($ctx,'-',$width)"></xsl:value-of> <xsl:text>':</xsl:text>
                <xsl:call-template name="subSelect"> <xsl:with-param name="name" select="quarter"></xsl:with-param></xsl:call-template>            
             </xsl:if> 
             </xsl:if>
        </xsl:otherwise>
    </xsl:choose>    
</xsl:template>
    
<!--process am & pm -->
<xsl:template name="apm" match="am|pm">
    <xsl:choose>
        <xsl:when test="alias">
            <!-- Handle Alias --> 
            <xsl:for-each select="alias">
                <xsl:call-template name="alias_template">
                    <xsl:with-param name="templateToCall">apm</xsl:with-param>
                    <xsl:with-param name="source" select="@source"></xsl:with-param>
                    <xsl:with-param name="xpath" select="@path"></xsl:with-param>
                </xsl:call-template>
            </xsl:for-each>            
        </xsl:when>
        <xsl:otherwise>            
        <xsl:if test="not(@draft) or @draft!='provisional' and @draft!='unconfirmed'">                
        <xsl:if test="name()='am'">

        'am</xsl:if>
            <xsl:if test="name()='pm'">
        'pm</xsl:if>
            <xsl:text>':"</xsl:text>
            <xsl:value-of select="."/><xsl:text>",</xsl:text>
        </xsl:if>
        </xsl:otherwise>
    </xsl:choose>
</xsl:template>    
    
<!-- process eras -->
<xsl:template match="eras" name="eras">
	<xsl:param name="name" select="name()"></xsl:param>
	<xsl:choose>
		<xsl:when test="count(./alias)>0">
			<!-- Handle Alias -->  
			<xsl:for-each select="./alias">
				<xsl:call-template name="alias_template">
					<xsl:with-param name="templateToCall">eras</xsl:with-param>
					<xsl:with-param name="source" select="@source"></xsl:with-param>
					<xsl:with-param name="xpath" select="@path"></xsl:with-param>
				</xsl:call-template>
			</xsl:for-each>	   
		</xsl:when>
		<xsl:otherwise>
			<xsl:choose>
				<xsl:when test="name()='eras'">
        				         <xsl:if test="count(./alias)=0">
        <xsl:text>                             
        </xsl:text>
        				           </xsl:if>
					<xsl:for-each select="*">
						<xsl:call-template name="eras"></xsl:call-template>
					</xsl:for-each>
				</xsl:when>
				<xsl:otherwise>
					<xsl:for-each select=".">
					    <xsl:if test="count(*[not(@draft)])>0 
					        or count(*[@draft!='provisional' and @draft!='unconfirmed'])>0"> 
						<xsl:text>
        '</xsl:text>
						<xsl:value-of select="$name"></xsl:value-of>
						<xsl:text>':</xsl:text>
						<xsl:call-template name="subSelect">
							<xsl:with-param name="name" select="era"></xsl:with-param>
						</xsl:call-template>
					        </xsl:if>
					</xsl:for-each>
				</xsl:otherwise>
				</xsl:choose>	  
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>
 
<!-- process dateFormat & timeFormat -->   
 <xsl:template match="dateFormats | timeFormats" name="date_time_Formats">
     <xsl:param name="width" select="@type"></xsl:param>
     <xsl:choose>
         <xsl:when test="count(./alias)>0">
             <!-- Handle Alias -->  
             <xsl:for-each select="./alias">
                 <xsl:call-template name="alias_template">
                     <xsl:with-param name="templateToCall">date_time_Formats</xsl:with-param>
                     <xsl:with-param name="source" select="@source"></xsl:with-param>
                     <xsl:with-param name="xpath" select="@path"></xsl:with-param>
                 </xsl:call-template>
             </xsl:for-each>       
         </xsl:when>
         <xsl:otherwise>
             <xsl:choose>
                 <xsl:when test="name()='dateFormats' or name()='timeFormats'">
                     <xsl:if test="count(./alias)=0">
                         <xsl:text>
                         </xsl:text>
                     </xsl:if>
                     <xsl:for-each select="*">
                         <xsl:call-template name="date_time_Formats"></xsl:call-template>
                     </xsl:for-each>
                 </xsl:when>
                 <xsl:otherwise>
                     <xsl:if test="name()!='default'">                         
                         <xsl:for-each select=".//pattern[not(@draft)] | 
                          .//pattern[@draft!='provisional' and @draft!='unconfirmed']">                         
        '<xsl:value-of select="name(..)"></xsl:value-of>
                         <xsl:text>-</xsl:text>
                         <xsl:value-of select='$width'/>': "<xsl:value-of select="."/>
                         <xsl:text>",</xsl:text>
                     </xsl:for-each>
                     </xsl:if>
                 </xsl:otherwise>
             </xsl:choose>
                </xsl:otherwise>
     </xsl:choose>
</xsl:template>
 
<!-- process dateTimeFormat -->
<xsl:template name="dateTimeFormats" match="dateTimeFormats">
    <xsl:param name="width" select="@type"></xsl:param>
    <xsl:choose>
    <xsl:when test="./alias">
        <!-- Handle Alias -->
        <xsl:for-each select="./alias">
            <xsl:call-template name="alias_template">
                <xsl:with-param name="templateToCall">dateTimeFormats</xsl:with-param>
                <xsl:with-param name="source" select="@source"></xsl:with-param>
                <xsl:with-param name="xpath" select="@path"></xsl:with-param>
            </xsl:call-template>
        </xsl:for-each>
    </xsl:when>
    <xsl:otherwise>
       <xsl:choose>
            <xsl:when test="name()='dateTimeFormats'">
                <xsl:if test="count(./alias)=0">
                    <xsl:text>
                    </xsl:text>
                </xsl:if>
                <xsl:for-each select="*">
                    <xsl:call-template name="dateTimeFormats"></xsl:call-template>
                </xsl:for-each>
            </xsl:when>
            <xsl:otherwise>
        <xsl:if test="name()!='default'">
        <!-- patterns -->
        <xsl:for-each select=".//pattern[not(@draft)] | 
            .//pattern[@draft!='provisional' and @draft!='unconfirmed']">    
        '<xsl:value-of select="name(..)"></xsl:value-of>
         <xsl:if test="string-length($width) > 0">
         	<xsl:text>-</xsl:text>
                      <xsl:value-of select='$width'/>
          </xsl:if>
           <xsl:text>': "</xsl:text>
           <xsl:value-of select="."/><xsl:text>", </xsl:text>          
        </xsl:for-each>
        <!-- availableFormats -->
        <xsl:if test="name()='availableFormats'">
         <xsl:if test="count(*[not(@draft)])>0 or 
                count(*[@draft!='provisional' and @draft!='unconfirmed'])>0">    
        'dateTimeAvailableFormats':<xsl:call-template name="subSelect"><xsl:with-param name="name" select="dateFormatItem"></xsl:with-param></xsl:call-template>
        </xsl:if>
        </xsl:if>
        <!-- appendItems -->
            <xsl:for-each select=".//appendItem[not(@draft)] | 
                .//appendItem[@draft!='provisional' and @draft!='unconfirmed']">
        'dateTimeFormats-appendItem-<xsl:value-of select="@request"></xsl:value-of>
            <xsl:text>':"</xsl:text>
            <xsl:value-of select="."></xsl:value-of>
            <xsl:text>",</xsl:text>
        </xsl:for-each>
     </xsl:if>
    </xsl:otherwise>
    </xsl:choose>
    </xsl:otherwise>
    </xsl:choose>
</xsl:template>
    
 <!-- process fields-->
<xsl:template name="fields" match="fields">
    <xsl:param name="width" select="@type"></xsl:param>
    <xsl:choose>
        <xsl:when test="count(./alias)>0">
            <!-- Handle Alias -->
            <xsl:for-each select="./alias">
                <xsl:call-template name="alias_template">
                    <xsl:with-param name="templateToCall">fields</xsl:with-param>
                    <xsl:with-param name="source" select="@source"></xsl:with-param>
                    <xsl:with-param name="xpath" select="@path"></xsl:with-param>
                </xsl:call-template>
            </xsl:for-each>
        </xsl:when>
        <xsl:otherwise>
            <xsl:choose>
                <xsl:when test="name()='fields'">
                    <xsl:if test="count(./alias)=0">
                        <xsl:text>
                        </xsl:text>
                    </xsl:if>
                    <xsl:for-each select="*">
                        <xsl:call-template name="fields"></xsl:call-template>
                    </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
            <xsl:for-each select=".//displayName[not(@draft)] | 
                .//displayName[@draft!='provisional' and @draft!='unconfirmed']">            
        'field-<xsl:value-of select="$width"></xsl:value-of>
               <xsl:text>':"</xsl:text>
               <xsl:value-of select="."/>
                <xsl:text>",</xsl:text>
            </xsl:for-each>                    
                </xsl:otherwise>
            </xsl:choose> 
         </xsl:otherwise>
    </xsl:choose>    
</xsl:template>

<!-- Sub output routine-->
<xsl:template name="subSelect">
    <xsl:param name="name"></xsl:param>
    <xsl:variable name="num" select="count(./$name[not(@draft)])+count(./$name[@draft!='provisional' and @draft!='unconfirmed'])"></xsl:variable>
    <xsl:if test="$num>1">
        <xsl:text>[</xsl:text>
        <xsl:for-each select="$name[not(@draft)] | $name[@draft!='provisional' and @draft!='unconfirmed']">
            <xsl:text>"</xsl:text>
            <xsl:value-of select="."/>
            <xsl:if test="$num>position()">
                <xsl:text>",</xsl:text>
            </xsl:if>            
            <xsl:if test="$num=position()">
                <xsl:text>"</xsl:text>
            </xsl:if>           
        </xsl:for-each>
        <xsl:text>],</xsl:text>
    </xsl:if>
    <xsl:if test="$num=1">
        <xsl:text>"</xsl:text><xsl:value-of select="$name[not(@draft)] 
            | $name[@draft!='provisional' and @draft!='unconfirmed']"/><xsl:text>",</xsl:text>
    </xsl:if>
</xsl:template>

<!-- Sub output routine-->
<xsl:variable name="vLowercaseChars_CONST" select="'abcdefghijklmnopqrstuvwxyz'"/> 
<xsl:variable name="vUppercaseChars_CONST" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
<xsl:template name="camel_case">
    <xsl:param name="name"></xsl:param>
    <xsl:variable name="words" select="tokenize($name, '-')"></xsl:variable>
    <xsl:for-each select="$words">
        <xsl:choose>
            <xsl:when test="position()=1">
                <xsl:value-of select="."/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="translate(substring(., 1, 1), $vLowercaseChars_CONST, $vUppercaseChars_CONST)"/><xsl:value-of select="substring(., 2)"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:for-each>
</xsl:template>

<!-- recursive process for alias -->
<xsl:template name="alias_template">
    <xsl:param name="templateToCall"></xsl:param>
    <xsl:param name="source"></xsl:param>
    <xsl:param name="xpath"></xsl:param>
    
    <xsl:variable name="cur_name" select="../name()"></xsl:variable>
    <xsl:variable name="cur_width" select="../@type"></xsl:variable>
    
    <xsl:choose>
        <!-- source="locale" -->
        <xsl:when test="compare($source,'locale')=0">
            <xsl:for-each select="saxon:evaluate(concat('../',$xpath))">   
                <xsl:call-template name="invoke_template_by_name">
                    <xsl:with-param name="templateName" select="$templateToCall"></xsl:with-param>
                    <xsl:with-param name="name" select="$cur_name"></xsl:with-param>
                    <xsl:with-param name="width" select="$cur_width"></xsl:with-param>
                </xsl:call-template>
            </xsl:for-each>
        </xsl:when>
        <xsl:otherwise>
            <!-- source is an external xml file -->
            <xsl:if test="string-length($xpath)>0">
                <xsl:for-each select="doc(concat($source,'.xml'))"> 
                    <xsl:for-each select="saxon:evaluate($xpath)">
                       <xsl:call-template name="invoke_template_by_name">
                           <xsl:with-param name="templateName" select="$templateToCall"></xsl:with-param>
                           <xsl:with-param name="name" select="$cur_name"></xsl:with-param>
                           <xsl:with-param name="width" select="$cur_width"></xsl:with-param>
                       </xsl:call-template>
                  </xsl:for-each>
                </xsl:for-each>
            </xsl:if>            
        </xsl:otherwise>
    </xsl:choose>
</xsl:template>   
    
  <!-- too bad that can only use standard xsl:call-template(name can not be variable) 
         error occurs if use <saxson:call-templates($templateToCall)  /> -->
 <xsl:template name="invoke_template_by_name">
     <xsl:param name="templateName"></xsl:param>
     <xsl:param name="name"></xsl:param> 
     <xsl:param name="width"></xsl:param>
     <xsl:if test="compare($templateName,'top')=0">
         <xsl:call-template name="top"></xsl:call-template>
     </xsl:if>
     <xsl:if test="compare($templateName,'calendar')=0">
         <xsl:call-template name="calendar"></xsl:call-template>
     </xsl:if>
     <xsl:if test="compare($templateName,'months_days_quarters')=0">
         <xsl:call-template name="months_days_quarters">
              <xsl:with-param name="width" select="$width"></xsl:with-param>
          </xsl:call-template>
      </xsl:if>
     <xsl:if test="compare($templateName,'apm')=0">
         <xsl:call-template name="apm"></xsl:call-template>
     </xsl:if>
     <xsl:if test="compare($templateName,'eras')=0">
         <xsl:call-template name="eras">
             <xsl:with-param name="name" select="$name"></xsl:with-param>
         </xsl:call-template>
     </xsl:if>
     <xsl:if test="compare($templateName,'date_time_Formats')=0">
         <xsl:call-template name="date_time_Formats">
             <xsl:with-param name="width" select="$width"></xsl:with-param>
         </xsl:call-template>
     </xsl:if>
     <xsl:if test="compare($templateName,'dateTimeFormats')=0">
         <xsl:call-template name="dateTimeFormats">
             <xsl:with-param name="width" select="$width"></xsl:with-param>
         </xsl:call-template>
     </xsl:if>
     <xsl:if test="compare($templateName,'fields')=0">
         <xsl:call-template name="fields">
             <xsl:with-param name="width" select="$width"></xsl:with-param>
         </xsl:call-template>
     </xsl:if>     
 </xsl:template>   
</xsl:stylesheet>