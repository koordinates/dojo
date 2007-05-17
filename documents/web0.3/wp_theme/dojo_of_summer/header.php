<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head profile="http://gmpg.org/xfn/11">
	<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />
	<title><?php bloginfo('name'); ?> <?php wp_title(); ?></title>
	<meta name="generator" content="WordPress <?php bloginfo('version'); ?>" /> <!-- leave this for stats -->
	<link rel="stylesheet" href="http://dojotoolkit.org/css/common.css" type="text/css" />
	<link rel="stylesheet" href="http://dojotoolkit.org/css/text.css" type="text/css" />
	<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>" type="text/css" media="screen" />
	<link rel="alternate" type="application/rss+xml" title="RSS" href="<?php bloginfo('rss2_url'); ?>" />
	<link rel="alternate" type="application/atom+xml" title="Atom" href="<?php bloginfo('atom_url'); ?>" />
	<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
	<?php wp_get_archives('type=monthly&format=link'); ?>
	<?php wp_head(); ?>
</head>
<body>
	<div id="foundation-header">
		<div id="header-links">
			<ul>
				<li><a href="http://dojotoolkit.org/" id="header-index">Home</a></li>
				<li><a href="http://dojotoolkit.org/developers/" id="header-developers">Developers</a></li>
				<li><a href="http://trac.dojotoolkit.org/" id="header-bugtracking">Bug Tracking</a></li>
				<li><a href="http://dojo.jot.com/" id="header-wiki">Wiki</a></li>
				<li><a href="http://dojotoolkit.org/foundation/" id="header-about">About the Dojo Foundation</a></li>
			</ul>
		</div>
	</div>
	<div id="header">
		<a href="http://blog.dojotoolkit.org"><span id="blog-title">Dojo.foo</span></a>
	</div>
	<div class="body">
