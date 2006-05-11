			<div class="sidebar">
				<h1>planet::dojo</h1>
				<div id="section-sidebar">
					<ul>
						<li>
							<h2 style="margin-top:0;"><?php _e('Archives'); ?></h2>
							<ul><?php wp_get_archives('type=monthly'); ?></ul>
						</li>
						<li>
							<h2><?php _e('Sections'); ?></h2>
							<ul><?php list_cats(0, '', 'name', 'asc', '', 1, 0, 1, 1, 1, 1, 0,'','','','','') ?></ul>
						</li>
						<li>
							<h2>Search</h2>
							<ul style="list-style:none;">
								<li><?php include (TEMPLATEPATH . '/searchform.php'); ?></li>
							</ul>
						</li>
						<li><h2><?php _e('Other'); ?></h2>
							<ul>
								<li><a href="<?php echo get_settings('siteurl'); ?>/wp-login.php"><?php _e('Login'); ?></a></li>
								<!-- li><a href="<?php echo get_settings('siteurl'); ?>/wp-register.php"><?php _e('Register'); ?></a></li -->
							</ul>
						</li>
					</ul>
				</div>
				<div id="site-sidebar">
					<ul>
						<?php get_links_list(); ?>
					</ul>
				</div>
			</div>
