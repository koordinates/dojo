<?php get_header(); ?>
	<div id="content" class="content">
	<?php if (have_posts()) : ?>
		<?php while (have_posts()) : the_post(); ?>
			<div class="post">
<div class="postdate" title="Posted on <?php the_time('d m Y') ?>">
<img src="http://dojotoolkit.org/img/dates/days.<?php the_time('d') ?>.png" border="0" />
<img src="http://dojotoolkit.org/img/dates/month.<?php the_time('m') ?>.png" border="0" />
<img src="http://dojotoolkit.org/img/dates/year.<?php the_time('Y') ?>.png" border="0" />
</div>
				<h2 class="posttitle" id="post-<?php the_ID(); ?>" style="font-size:1.15em;">
<a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title(); ?>"><?php the_title(); ?></a></h2>
				<!-- h4><?php the_time('D j M Y') ?> by <?php the_author() ?></h4 -->
				<div class="entry">
					<?php the_content('Read the rest of this entry &raquo;'); ?>
				</div>
				<p class="postmetadata">
				posted by <?php the_author() ?> at <a href="<?php echo get_permalink() ?>" rel="bookmark" title="Permanent Link: <?php the_title(); ?>"><?php the_time('g:i a') ?> PST</a>
				& filed under <?php the_category(', ') ?> <strong>|</strong> <?php edit_post_link('Edit','','<strong>|</strong>'); ?>  <?php comments_popup_link('No Comments &#187;', '1 Comment &#187;', '% Comments &#187;'); ?>
				</p>
				<!--
				<?php trackback_rdf(); ?>
				--><br />
			</div>
		<?php endwhile; ?>
		<div class="navigation">
			<div class="alignleft"><?php posts_nav_link('','','&laquo; Previous Entries') ?></div>
			<div class="alignright"><?php posts_nav_link('','Next Entries &raquo;','') ?></div>
		</div>
	<?php else : ?>
		<h2 class="center">Not Found</h2>
		<p class="center"><?php _e("Sorry, but you are looking for something that isn't here."); ?></p>
		<?php include (TEMPLATEPATH . "/searchform.php"); ?>
	<?php endif; ?>
	</div>
<?php get_sidebar(); ?>
<?php get_footer(); ?>
