<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">


<xsl:output method="html" indent="yes"
	omit-xml-declaration="yes"
	doctype-public="-//W3C//DTD HTML 4.01//EN"
	doctype-system="http://www.w3.org/TR/html4/strict.dtd"/>

<xsl:template match="/">
<html>
	<head>
		<title><xsl:value-of select="//@name"/></title>
		<link rel="stylesheet" href="style.css"/>
	</head>
	<body>
		<p class="header"><a href="./">idslib</a></p>
		<h1><xsl:value-of select="//@name"/></h1>
		<xsl:apply-templates/>
		<p class="footer">Copyright 2006 <a href="http://delete.me.uk/">Paul Sowden</a>, all rights reserved.</p>
	</body>
</html>
</xsl:template>

<xsl:template match="property">
	<div class="property" id="{@name}">
		<h3><code><strong><xsl:value-of select="@name"/></strong></code></h3>
		<xsl:copy-of select="description/*"/>
	</div>
</xsl:template>

<xsl:template match="function | constructor">
	<div class="function" id="{@name}">
		<h3><code><strong><xsl:value-of select="@name"/></strong>
			(<xsl:for-each select="args/arg | args/vararg">
				<xsl:if test="@optional = 'true'">[</xsl:if>
				<xsl:if test="position() != 1">, </xsl:if>
				<span class="argument" title="{@type}"><xsl:value-of select="self::arg"/></span>
				<xsl:if test="self::vararg">...</xsl:if>
				<xsl:if test="@optional = 'true'">]</xsl:if>
			</xsl:for-each>)
		</code></h3>
		<xsl:copy-of select="description/*"/>
		<xsl:if test="example">
			<h4>Example</h4>
			<xsl:copy-of select="example/*"/>
		</xsl:if>
		<xsl:if test="note">
			<h4>Note</h4>
			<xsl:copy-of select="note/*"/>
		</xsl:if>
	</div>
</xsl:template>

<xsl:template match="object[not(@name)] | function[not(@name)]">
	<code><xsl:value-of select="*"/></code>
</xsl:template>

<xsl:template match="description">
	<div class="description">
		<xsl:copy-of select="*"/>
	</div>
</xsl:template>

<xsl:template match="example">
	<div class="example">
		<xsl:copy-of select="*"/>
	</div>
</xsl:template>


</xsl:stylesheet>
