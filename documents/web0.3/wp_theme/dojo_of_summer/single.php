<?php get_header(); ?>
<div id="content" class="content">
	<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
		<div class="post">
<div class="postdate" title="Posted on <?php the_time('d m Y') ?>">
<img src="http://dojotoolkit.org/img/dates/days.<?php the_time('d') ?>.png" border="0" />
<img src="http://dojotoolkit.org/img/dates/month.<?php the_time('m') ?>.png" border="0" />
<img src="http://dojotoolkit.org/img/dates/year.<?php the_time('Y') ?>.png" border="0" />
</div>
			<h2 style="font-size:1.15em;" class="posttitle" id="post-<?php the_ID(); ?>"><a href="<?php echo get_permalink() ?>" rel="bookmark" title="Permanent Link: <?php the_title(); ?>"><?php the_title(); ?></a></h2>
			<div class="entrytext">
				<?php the_content('<p class="serif">Read the rest of this entry &raquo;</p>'); ?>
				<?php link_pages('<p><strong>Pages:</strong> ', '</p>', 'number'); ?>
				<p class="postmetadata alt"> 
					posted by <?php the_author() ?> at <a href="<?php echo get_permalink() ?>" rel="bookmark" title="Permanent Link: <?php the_title(); ?>"><?php the_time() ?></a>
					& filed under <?php the_category(', ') ?> <strong>|</strong> <?php edit_post_link('Edit','','<strong>|</strong>'); ?>  <?php comments_popup_link('No Comments &#187;', '1 Comment &#187;', '% Comments &#187;'); ?>
				</p>
			</div>
		</div>
		<?php comments_template(); ?>
	<?php endwhile; else: ?>
		<p><?php _e('Sorry, no posts matched your criteria.'); ?></p>
	<?php endif; ?>
</div>
<?php get_sidebar(); ?>
<?php get_footer(); ?>
