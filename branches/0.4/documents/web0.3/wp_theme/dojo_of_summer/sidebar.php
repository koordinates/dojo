			<div class="sidebar" style="font-size:0.85em;padding:1em;">
				<div id="section-sidebar">
					<h2 style="margin-top:0;">Search</h2>
					<div><?php include (TEMPLATEPATH . '/searchform.php'); ?></div>
					<h2><?php _e('Archives'); ?></h2>
					<ul><?php wp_get_archives('type=monthly'); ?></ul>
					<h2><?php _e('Sections'); ?></h2>
					<ul><?php list_cats(0, '', 'name', 'asc', '', 1, 0, 1, 1, 1, 1, 0,'','','','','') ?></ul>
					<ul><?php get_links_list(); ?></ul>
					<div><a href="<?php echo get_settings('siteurl'); ?>/wp-login.php"><?php _e('Login'); ?></a></div>
				</div>
			</div>
