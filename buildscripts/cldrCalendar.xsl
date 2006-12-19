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
                <xsl:when test="compare(name(),'calendars')=0">
                    <!-- calendars -->
                    <xsl:for-each select="calendar">       
                        <xsl:result-document href="{concat(@type,'.js')}" >/*
        Copyright (c) 2004-2006, The Dojo Foundation
        All Rights Reserved.
        
        Licensed under the Academic Free License version 2.1 or above OR the
        modified BSD license. For more information on Dojo licensing, see:
        
                http://dojotoolkit.org/community/licensing.shtml
*/

({            
        //calendar type = <xsl:value-of select="./@type"/>
                           <xsl:call-template name="calendar"></xsl:call-template>

})
                        </xsl:result-document>
                    </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>                    
                    <xsl:if test="compare(name(),'ldml')=0">
                        <!-- ldml -->
                        <xsl:for-each select="dates">
                            <xsl:call-template name="top"></xsl:call-template>
                        </xsl:for-each>
                    </xsl:if>
                    <xsl:if test="compare(name(),'dates')=0">
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
    <xsl:param name="width" select="@type"></xsl:param>
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
            <xsl:if test="compare(name(),'months')=0 or compare(name(),'monthContext')=0
                       or compare(name(),'days')=0 or compare(name(),'dayContext')=0
                       or compare(name(),'quarters')=0 or compare(name(),'quarterContext')=0">
                <xsl:if test="contains(name(),'s') and count(./alias)=0">
                    <xsl:text>
                    </xsl:text>
                </xsl:if>
                <xsl:for-each select="*">
                    <xsl:call-template name="months_days_quarters"></xsl:call-template>
                </xsl:for-each>
            </xsl:if>
            <xsl:if test="compare(name(),'monthWidth')=0">
        'months-<xsl:value-of select="concat($ctx,'-',$width)"></xsl:value-of><xsl:text>':</xsl:text>
                <xsl:call-template name="subSelect"> <xsl:with-param name="name" select="month"></xsl:with-param></xsl:call-template>            
            </xsl:if>
            <xsl:if test="compare(name(),'dayWidth')=0">
        'days-<xsl:value-of select="concat($ctx,'-',$width)"></xsl:value-of><xsl:text>':</xsl:text>
                <xsl:call-template name="subSelect"> <xsl:with-param name="name" select="day"></xsl:with-param></xsl:call-template>        
            </xsl:if>
            <xsl:if test="compare(name(),'quarterWidth')=0">
        'quarters-<xsl:value-of select="concat($ctx,'-',$width)"></xsl:value-of> <xsl:text>':</xsl:text>
                <xsl:call-template name="subSelect"> <xsl:with-param name="name" select="quarter"></xsl:with-param></xsl:call-template>            
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

        <xsl:if test="compare(name(),'am')=0">

        'am</xsl:if>
            <xsl:if test="compare(name(),'pm')=0">
        'pm</xsl:if>
            <xsl:text>':"</xsl:text>
            <xsl:value-of select="."/><xsl:text>",</xsl:text>
        </xsl:otherwise>
    </xsl:choose>
</xsl:template>    
    
<!-- process ears -->
    <xsl:template match="eras" name="eras">
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
                <xsl:when test="compare(name(),'eras')=0">
                    <xsl:if test="count(./alias)=0">
                        <xsl:text>
                        </xsl:text>
                    </xsl:if>
                    <xsl:for-each select="*">
                        <xsl:call-template name="eras"></xsl:call-template>
                    </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
        'ears-<xsl:for-each select=".">
                        <xsl:value-of select="name()"></xsl:value-of>
                        <xsl:text>':</xsl:text>
                        <xsl:call-template name="subSelect"> <xsl:with-param name="name" select="era"></xsl:with-param></xsl:call-template>
                    </xsl:for-each>
                </xsl:otherwise>
                </xsl:choose>      
           </xsl:otherwise>
       </xsl:choose>
</xsl:template>
 
<!-- process dateFormat & timeFormat -->   
 <xsl:template match="dateFormats | timeFormats" name="date_time_Formats">
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
                 <xsl:when test="compare(name(),'dateFormats')=0 or compare(name(),'timeFormats')=0">
                     <xsl:if test="count(./alias)=0">
                         <xsl:text>
                         </xsl:text>
                     </xsl:if>
                     <xsl:for-each select="*">
                         <xsl:call-template name="date_time_Formats"></xsl:call-template>
                     </xsl:for-each>
                 </xsl:when>
                 <xsl:otherwise>
                     <xsl:if test="compare(name(),'default')!=0">                         
                     <xsl:for-each select=".//pattern">
        '<xsl:value-of select="name(..)"></xsl:value-of>
                         <xsl:text>-</xsl:text>
                         <xsl:value-of select='../../@type'/>': "<xsl:value-of select="."/>
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
    <xsl:choose>
    <xsl:when test=".//alias">
        <!-- Handle Alias -->
        <xsl:for-each select=".//alias">
            <xsl:call-template name="alias_template">
                <xsl:with-param name="templateToCall">dateTimeFormats</xsl:with-param>
                <xsl:with-param name="source" select="@source"></xsl:with-param>
                <xsl:with-param name="xpath" select="@path"></xsl:with-param>
            </xsl:call-template>
        </xsl:for-each>
    </xsl:when>
    <xsl:otherwise>
        <!-- patterns -->
        <xsl:for-each select=".//pattern">
 
        '<xsl:value-of select="name(..)"></xsl:value-of>
            <xsl:text>': "</xsl:text>
            <xsl:value-of select="."/><xsl:text>", </xsl:text>          
        </xsl:for-each>
        <!-- availableFormats -->
        <xsl:for-each select="availableFormats">
        'dateTimeAvailableFormats':<xsl:call-template name="subSelect"><xsl:with-param name="name" select="dateFormatItem"></xsl:with-param></xsl:call-template>
        </xsl:for-each>
        <!-- appendItems -->
        <xsl:for-each select=".//appendItem">
        'dateTimeFormats-appendItem-<xsl:value-of select="@request"></xsl:value-of>
            <xsl:text>':"</xsl:text>
            <xsl:value-of select="."></xsl:value-of>
            <xsl:text>",</xsl:text>
        </xsl:for-each>
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
                <xsl:when test="compare(name(),'fields')=0">
                    <xsl:if test="count(./alias)=0">
                        <xsl:text>
                        </xsl:text>
                    </xsl:if>
                    <xsl:for-each select="*">
                        <xsl:call-template name="fields"></xsl:call-template>
                    </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
            <xsl:for-each select=".//displayName">
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
    <xsl:variable name="num" select="count(./$name)"></xsl:variable>
    <xsl:if test="$num>1">
        <xsl:text>[</xsl:text>
        <xsl:for-each select="$name">
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
        <xsl:text>"</xsl:text><xsl:value-of select="$name"/><xsl:text>",</xsl:text>
    </xsl:if>
</xsl:template>

<!-- recursive process for alias -->
<xsl:template name="alias_template">
    <xsl:param name="templateToCall"></xsl:param>
    <xsl:param name="source"></xsl:param>
    <xsl:param name="xpath"></xsl:param>
     <xsl:variable name="cur_width" select="../@type"></xsl:variable>
    
    <xsl:choose>
        <!-- source="locale" -->
        <xsl:when test="compare($source,'locale')=0">
            <xsl:for-each select="saxon:evaluate(concat('../',$xpath))">   
                <xsl:call-template name="invoke_template_by_name">
                    <xsl:with-param name="templateName" select="$templateToCall"></xsl:with-param>
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
         <xsl:call-template name="eras"></xsl:call-template>
     </xsl:if>
     <xsl:if test="compare($templateName,'date_time_Formats')=0">
         <xsl:call-template name="date_time_Formats"></xsl:call-template>
     </xsl:if>
     <xsl:if test="compare($templateName,'dateTimeFormats')=0">
         <xsl:call-template name="dateTimeFormats"></xsl:call-template>
     </xsl:if>
     <xsl:if test="compare($templateName,'fields')=0">
         <xsl:call-template name="fields">
             <xsl:with-param name="width" select="$width"></xsl:with-param>
         </xsl:call-template>
     </xsl:if>     
 </xsl:template>   
</xsl:stylesheet>