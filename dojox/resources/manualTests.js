dojo.provide("dojox.tests.manualTests");

try{
if(dojo.isBrowser){
	var userArgs = window.location.search.replace(/[\?&](dojoUrl|testUrl|testModule)=[^&]*/g,"").replace(/^&/,"?");
	doh.registerUrl("dojox/analytics/tests/test_analytics.html", dojo.moduleUrl("dojox","analytics/tests/test_analytics.html"+userArgs), 99999999);
	doh.registerUrl("dojox/av/tests/flash.html", dojo.moduleUrl("dojox","av/tests/flash.html"+userArgs), 99999999);
	doh.registerUrl("dojox/av/tests/quicktime.html", dojo.moduleUrl("dojox","av/tests/quicktime.html"+userArgs), 99999999);
	doh.registerUrl("dojox/charting/tests/test_bars.html", dojo.moduleUrl("dojox","charting/tests/test_bars.html"+userArgs), 99999999);
	doh.registerUrl("dojox/charting/tests/test_chart2d.html", dojo.moduleUrl("dojox","charting/tests/test_chart2d.html"+userArgs), 99999999);
	doh.registerUrl("dojox/charting/tests/test_chart2d_updating.html", dojo.moduleUrl("dojox","charting/tests/test_chart2d_updating.html"+userArgs), 99999999);
	doh.registerUrl("dojox/charting/tests/test_cylinders.html", dojo.moduleUrl("dojox","charting/tests/test_cylinders.html"+userArgs), 99999999);
	doh.registerUrl("dojox/charting/tests/test_labels2d.html", dojo.moduleUrl("dojox","charting/tests/test_labels2d.html"+userArgs), 99999999);
	doh.registerUrl("dojox/charting/tests/test_pie2d.html", dojo.moduleUrl("dojox","charting/tests/test_pie2d.html"+userArgs), 99999999);
	doh.registerUrl("dojox/charting/tests/test_scaler.html", dojo.moduleUrl("dojox","charting/tests/test_scaler.html"+userArgs), 99999999);
	doh.registerUrl("dojox/charting/tests/test_sparklines.html", dojo.moduleUrl("dojox","charting/tests/test_sparklines.html"+userArgs), 99999999);
	doh.registerUrl("dojox/charting/tests/test_widget2d.html", dojo.moduleUrl("dojox","charting/tests/test_widget2d.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/demos/demo_DataDemoTable.html", dojo.moduleUrl("dojox","data/demos/demo_DataDemoTable.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/demos/demo_FlickrRestStore.html", dojo.moduleUrl("dojox","data/demos/demo_FlickrRestStore.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/demos/demo_FlickrStore.html", dojo.moduleUrl("dojox","data/demos/demo_FlickrStore.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/demos/demo_LazyLoad.html", dojo.moduleUrl("dojox","data/demos/demo_LazyLoad.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/demos/demo_MultiStores.html", dojo.moduleUrl("dojox","data/demos/demo_MultiStores.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/demos/demo_PicasaStore.html", dojo.moduleUrl("dojox","data/demos/demo_PicasaStore.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/demos/demo_QueryReadStore.html", dojo.moduleUrl("dojox","data/demos/demo_QueryReadStore.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/demos/demo_QueryReadStore_filter.html", dojo.moduleUrl("dojox","data/demos/demo_QueryReadStore_filter.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/demos/demo_QueryReadStore_sort.html", dojo.moduleUrl("dojox","data/demos/demo_QueryReadStore_sort.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/tests/QueryReadStore.html", dojo.moduleUrl("dojox","data/tests/QueryReadStore.html"+userArgs), 99999999);
	doh.registerUrl("dojox/data/tests/test_Tree_vs_jsonPathStore.html", dojo.moduleUrl("dojox","data/tests/test_Tree_vs_jsonPathStore.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_Animation.html", dojo.moduleUrl("dojox","dtl/demos/demo_Animation.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_Blog.html", dojo.moduleUrl("dojox","dtl/demos/demo_Blog.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_Data.html", dojo.moduleUrl("dojox","dtl/demos/demo_Data.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_Dijitless.html", dojo.moduleUrl("dojox","dtl/demos/demo_Dijitless.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_Events.html", dojo.moduleUrl("dojox","dtl/demos/demo_Events.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_HtmlTemplated.html", dojo.moduleUrl("dojox","dtl/demos/demo_HtmlTemplated.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_Inline.html", dojo.moduleUrl("dojox","dtl/demos/demo_Inline.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_NodeList.html", dojo.moduleUrl("dojox","dtl/demos/demo_NodeList.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_Table.html", dojo.moduleUrl("dojox","dtl/demos/demo_Table.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_Templated.html", dojo.moduleUrl("dojox","dtl/demos/demo_Templated.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/demos/demo_Tree.html", dojo.moduleUrl("dojox","dtl/demos/demo_Tree.html"+userArgs), 99999999);
	doh.registerUrl("dojox/dtl/tests/demo_Templated_Jaxer.html", dojo.moduleUrl("dojox","dtl/tests/demo_Templated_Jaxer.html"+userArgs), 99999999);
	doh.registerUrl("dojox/encoding/tests/compression/colors2.html", dojo.moduleUrl("dojox","encoding/tests/compression/colors2.html"+userArgs), 99999999);
	doh.registerUrl("dojox/encoding/tests/compression/colors3.html", dojo.moduleUrl("dojox","encoding/tests/compression/colors3.html"+userArgs), 99999999);
	doh.registerUrl("dojox/encoding/tests/compression/test.html", dojo.moduleUrl("dojox","encoding/tests/compression/test.html"+userArgs), 99999999);
	doh.registerUrl("dojox/encoding/tests/compression/vq.html", dojo.moduleUrl("dojox","encoding/tests/compression/vq.html"+userArgs), 99999999);
	doh.registerUrl("dojox/flash/tests/test_flash.html", dojo.moduleUrl("dojox","flash/tests/test_flash.html"+userArgs), 99999999);
	doh.registerUrl("dojox/form/tests/test_FileInput.html", dojo.moduleUrl("dojox","form/tests/test_FileInput.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/example_backgroundPosition.html", dojo.moduleUrl("dojox","fx/tests/example_backgroundPosition.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/example_dojoAnimations.html", dojo.moduleUrl("dojox","fx/tests/example_dojoAnimations.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/example_easingChart2D.html", dojo.moduleUrl("dojox","fx/tests/example_easingChart2D.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/example_Line.html", dojo.moduleUrl("dojox","fx/tests/example_Line.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/test_animateClass.html", dojo.moduleUrl("dojox","fx/tests/test_animateClass.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/test_crossFade.html", dojo.moduleUrl("dojox","fx/tests/test_crossFade.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/test_easing.html", dojo.moduleUrl("dojox","fx/tests/test_easing.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/test_highlight.html", dojo.moduleUrl("dojox","fx/tests/test_highlight.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/test_Nodelist-fx.html", dojo.moduleUrl("dojox","fx/tests/test_Nodelist-fx.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/test_scroll.html", dojo.moduleUrl("dojox","fx/tests/test_scroll.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/test_Shadow.html", dojo.moduleUrl("dojox","fx/tests/test_Shadow.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/test_sizeTo.html", dojo.moduleUrl("dojox","fx/tests/test_sizeTo.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/test_slideBy.html", dojo.moduleUrl("dojox","fx/tests/test_slideBy.html"+userArgs), 99999999);
	doh.registerUrl("dojox/fx/tests/test_wipeTo.html", dojo.moduleUrl("dojox","fx/tests/test_wipeTo.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/beautify.html", dojo.moduleUrl("dojox","gfx/demos/beautify.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/butterfly.html", dojo.moduleUrl("dojox","gfx/demos/butterfly.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/career_test.html", dojo.moduleUrl("dojox","gfx/demos/career_test.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/circles.html", dojo.moduleUrl("dojox","gfx/demos/circles.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/clock.html", dojo.moduleUrl("dojox","gfx/demos/clock.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/clockWidget.html", dojo.moduleUrl("dojox","gfx/demos/clockWidget.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/clock_black.html", dojo.moduleUrl("dojox","gfx/demos/clock_black.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/creator.html", dojo.moduleUrl("dojox","gfx/demos/creator.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/inspector.html", dojo.moduleUrl("dojox","gfx/demos/inspector.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/lion.html", dojo.moduleUrl("dojox","gfx/demos/lion.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/roundedPane.html", dojo.moduleUrl("dojox","gfx/demos/roundedPane.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/tiger.html", dojo.moduleUrl("dojox","gfx/demos/tiger.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/demos/tooltip.html", dojo.moduleUrl("dojox","gfx/demos/tooltip.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_arc.html", dojo.moduleUrl("dojox","gfx/tests/test_arc.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_bezier.html", dojo.moduleUrl("dojox","gfx/tests/test_bezier.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_decompose.html", dojo.moduleUrl("dojox","gfx/tests/test_decompose.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_fill.html", dojo.moduleUrl("dojox","gfx/tests/test_fill.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_fx.html", dojo.moduleUrl("dojox","gfx/tests/test_fx.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_gfx.html", dojo.moduleUrl("dojox","gfx/tests/test_gfx.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_gradient.html", dojo.moduleUrl("dojox","gfx/tests/test_gradient.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_group.html", dojo.moduleUrl("dojox","gfx/tests/test_group.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_image1.html", dojo.moduleUrl("dojox","gfx/tests/test_image1.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_image2.html", dojo.moduleUrl("dojox","gfx/tests/test_image2.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_linearGradient.html", dojo.moduleUrl("dojox","gfx/tests/test_linearGradient.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_linestyle.html", dojo.moduleUrl("dojox","gfx/tests/test_linestyle.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_pattern.html", dojo.moduleUrl("dojox","gfx/tests/test_pattern.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_poly.html", dojo.moduleUrl("dojox","gfx/tests/test_poly.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_resize.html", dojo.moduleUrl("dojox","gfx/tests/test_resize.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_setPath.html", dojo.moduleUrl("dojox","gfx/tests/test_setPath.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_tbbox.html", dojo.moduleUrl("dojox","gfx/tests/test_tbbox.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_text.html", dojo.moduleUrl("dojox","gfx/tests/test_text.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_textpath.html", dojo.moduleUrl("dojox","gfx/tests/test_textpath.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx/tests/test_transform.html", dojo.moduleUrl("dojox","gfx/tests/test_transform.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_camerarotate.html", dojo.moduleUrl("dojox","gfx3d/tests/test_camerarotate.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_camerarotate_shaded.html", dojo.moduleUrl("dojox","gfx3d/tests/test_camerarotate_shaded.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_cube.html", dojo.moduleUrl("dojox","gfx3d/tests/test_cube.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_cylinder.html", dojo.moduleUrl("dojox","gfx3d/tests/test_cylinder.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_drawer.html", dojo.moduleUrl("dojox","gfx3d/tests/test_drawer.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_edges.html", dojo.moduleUrl("dojox","gfx3d/tests/test_edges.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_matrix.html", dojo.moduleUrl("dojox","gfx3d/tests/test_matrix.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_orbit.html", dojo.moduleUrl("dojox","gfx3d/tests/test_orbit.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_overlap.html", dojo.moduleUrl("dojox","gfx3d/tests/test_overlap.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_polygon.html", dojo.moduleUrl("dojox","gfx3d/tests/test_polygon.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_quads.html", dojo.moduleUrl("dojox","gfx3d/tests/test_quads.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_rotate.html", dojo.moduleUrl("dojox","gfx3d/tests/test_rotate.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_scene.html", dojo.moduleUrl("dojox","gfx3d/tests/test_scene.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_triangles.html", dojo.moduleUrl("dojox","gfx3d/tests/test_triangles.html"+userArgs), 99999999);
	doh.registerUrl("dojox/gfx3d/tests/test_vector.html", dojo.moduleUrl("dojox","gfx3d/tests/test_vector.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_change_structure.html", dojo.moduleUrl("dojox","grid/tests/test_change_structure.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_custom_sort.html", dojo.moduleUrl("dojox","grid/tests/test_custom_sort.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_dojo_data_edit.html", dojo.moduleUrl("dojox","grid/tests/test_dojo_data_edit.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_dojo_data_model.html", dojo.moduleUrl("dojox","grid/tests/test_dojo_data_model.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_dojo_data_model_EmptyResultSet.html", dojo.moduleUrl("dojox","grid/tests/test_dojo_data_model_EmptyResultSet.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_dojo_data_model_multiStores.html", dojo.moduleUrl("dojox","grid/tests/test_dojo_data_model_multiStores.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_dojo_data_model_processError.html", dojo.moduleUrl("dojox","grid/tests/test_dojo_data_model_processError.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_dojo_data_notification.html", dojo.moduleUrl("dojox","grid/tests/test_dojo_data_notification.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_edit.html", dojo.moduleUrl("dojox","grid/tests/test_edit.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_edit_canEdit.html", dojo.moduleUrl("dojox","grid/tests/test_edit_canEdit.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_edit_dijit.html", dojo.moduleUrl("dojox","grid/tests/test_edit_dijit.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_events.html", dojo.moduleUrl("dojox","grid/tests/test_events.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_expand.html", dojo.moduleUrl("dojox","grid/tests/test_expand.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid.html", dojo.moduleUrl("dojox","grid/tests/test_grid.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_dlg.html", dojo.moduleUrl("dojox","grid/tests/test_grid_dlg.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_headerHeight.html", dojo.moduleUrl("dojox","grid/tests/test_grid_headerHeight.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_layout.html", dojo.moduleUrl("dojox","grid/tests/test_grid_layout.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_layout_borderContainer.html", dojo.moduleUrl("dojox","grid/tests/test_grid_layout_borderContainer.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_layout_LayoutContainer.html", dojo.moduleUrl("dojox","grid/tests/test_grid_layout_LayoutContainer.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_object_model_change.html", dojo.moduleUrl("dojox","grid/tests/test_grid_object_model_change.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_programmatic.html", dojo.moduleUrl("dojox","grid/tests/test_grid_programmatic.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_programmatic_layout.html", dojo.moduleUrl("dojox","grid/tests/test_grid_programmatic_layout.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_rtl.html", dojo.moduleUrl("dojox","grid/tests/test_grid_rtl.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_themes.html", dojo.moduleUrl("dojox","grid/tests/test_grid_themes.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_grid_tooltip_menu.html", dojo.moduleUrl("dojox","grid/tests/test_grid_tooltip_menu.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_keyboard.html", dojo.moduleUrl("dojox","grid/tests/test_keyboard.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_markup.html", dojo.moduleUrl("dojox","grid/tests/test_markup.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_mysql_edit.html", dojo.moduleUrl("dojox","grid/tests/test_mysql_edit.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_sizing.html", dojo.moduleUrl("dojox","grid/tests/test_sizing.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_sizing_100rows.html", dojo.moduleUrl("dojox","grid/tests/test_sizing_100rows.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_sizing_ResizeHandle.html", dojo.moduleUrl("dojox","grid/tests/test_sizing_ResizeHandle.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_styling.html", dojo.moduleUrl("dojox","grid/tests/test_styling.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_subgrid.html", dojo.moduleUrl("dojox","grid/tests/test_subgrid.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_tundra_edit.html", dojo.moduleUrl("dojox","grid/tests/test_tundra_edit.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_yahoo_images.html", dojo.moduleUrl("dojox","grid/tests/test_yahoo_images.html"+userArgs), 99999999);
	doh.registerUrl("dojox/grid/tests/test_yahoo_search.html", dojo.moduleUrl("dojox","grid/tests/test_yahoo_search.html"+userArgs), 99999999);
	doh.registerUrl("dojox/help/demos/demo_Console.html", dojo.moduleUrl("dojox","help/demos/demo_Console.html"+userArgs), 99999999);
	doh.registerUrl("dojox/highlight/tests/test_highlight.html", dojo.moduleUrl("dojox","highlight/tests/test_highlight.html"+userArgs), 99999999);
	doh.registerUrl("dojox/highlight/tests/test_pygments.html", dojo.moduleUrl("dojox","highlight/tests/test_pygments.html"+userArgs), 99999999);
	doh.registerUrl("dojox/image/tests/test_Gallery.html", dojo.moduleUrl("dojox","image/tests/test_Gallery.html"+userArgs), 99999999);
	doh.registerUrl("dojox/image/tests/test_Lightbox.html", dojo.moduleUrl("dojox","image/tests/test_Lightbox.html"+userArgs), 99999999);
	doh.registerUrl("dojox/image/tests/test_Magnifier.html", dojo.moduleUrl("dojox","image/tests/test_Magnifier.html"+userArgs), 99999999);
	doh.registerUrl("dojox/image/tests/test_MagnifierLite.html", dojo.moduleUrl("dojox","image/tests/test_MagnifierLite.html"+userArgs), 99999999);
	doh.registerUrl("dojox/image/tests/test_SlideShow.html", dojo.moduleUrl("dojox","image/tests/test_SlideShow.html"+userArgs), 99999999);
	doh.registerUrl("dojox/image/tests/test_ThumbnailPicker.html", dojo.moduleUrl("dojox","image/tests/test_ThumbnailPicker.html"+userArgs), 99999999);
	doh.registerUrl("dojox/io/proxy/tests/xip.html", dojo.moduleUrl("dojox","io/proxy/tests/xip.html"+userArgs), 99999999);
	doh.registerUrl("dojox/lang/tests/fun_perf.html", dojo.moduleUrl("dojox","lang/tests/fun_perf.html"+userArgs), 99999999);
	doh.registerUrl("dojox/layout/tests/test_DragPane.html", dojo.moduleUrl("dojox","layout/tests/test_DragPane.html"+userArgs), 99999999);
	doh.registerUrl("dojox/layout/tests/test_ExpandoPane.html", dojo.moduleUrl("dojox","layout/tests/test_ExpandoPane.html"+userArgs), 99999999);
	doh.registerUrl("dojox/layout/tests/test_ExpandoPane_code.html", dojo.moduleUrl("dojox","layout/tests/test_ExpandoPane_code.html"+userArgs), 99999999);
	doh.registerUrl("dojox/layout/tests/test_ExpandoPane_more.html", dojo.moduleUrl("dojox","layout/tests/test_ExpandoPane_more.html"+userArgs), 99999999);
	doh.registerUrl("dojox/layout/tests/test_FloatingPane.html", dojo.moduleUrl("dojox","layout/tests/test_FloatingPane.html"+userArgs), 99999999);
	doh.registerUrl("dojox/layout/tests/test_RadioGroup.html", dojo.moduleUrl("dojox","layout/tests/test_RadioGroup.html"+userArgs), 99999999);
	doh.registerUrl("dojox/layout/tests/test_ResizeHandle.html", dojo.moduleUrl("dojox","layout/tests/test_ResizeHandle.html"+userArgs), 99999999);
	doh.registerUrl("dojox/layout/tests/test_ScrollPane.html", dojo.moduleUrl("dojox","layout/tests/test_ScrollPane.html"+userArgs), 99999999);
	doh.registerUrl("dojox/layout/tests/test_ScrollPaneSingle.html", dojo.moduleUrl("dojox","layout/tests/test_ScrollPaneSingle.html"+userArgs), 99999999);
	doh.registerUrl("dojox/layout/tests/test_SizingPane.html", dojo.moduleUrl("dojox","layout/tests/test_SizingPane.html"+userArgs), 99999999);
	doh.registerUrl("dojox/off/demos/editor/editor.html", dojo.moduleUrl("dojox","off/demos/editor/editor.html"+userArgs), 99999999);
	doh.registerUrl("dojox/off/demos/helloworld/helloworld.html", dojo.moduleUrl("dojox","off/demos/helloworld/helloworld.html"+userArgs), 99999999);
	doh.registerUrl("dojox/presentation/tests/test_presentation.html", dojo.moduleUrl("dojox","presentation/tests/test_presentation.html"+userArgs), 99999999);
	doh.registerUrl("dojox/rpc/demos/demo_JsonRestStore_CouchDB.html", dojo.moduleUrl("dojox","rpc/demos/demo_JsonRestStore_CouchDB.html"+userArgs), 99999999);
	doh.registerUrl("dojox/rpc/demos/demo_JsonRestStore_Persevere.html", dojo.moduleUrl("dojox","rpc/demos/demo_JsonRestStore_Persevere.html"+userArgs), 99999999);
	doh.registerUrl("dojox/rpc/demos/documentation.html", dojo.moduleUrl("dojox","rpc/demos/documentation.html"+userArgs), 99999999);
	doh.registerUrl("dojox/rpc/demos/yahoo.html", dojo.moduleUrl("dojox","rpc/demos/yahoo.html"+userArgs), 99999999);
	doh.registerUrl("dojox/rpc/tests/test_dojo_data_model_persevere.html", dojo.moduleUrl("dojox","rpc/tests/test_dojo_data_model_persevere.html"+userArgs), 99999999);
	doh.registerUrl("dojox/sketch/tests/test_full.html", dojo.moduleUrl("dojox","sketch/tests/test_full.html"+userArgs), 99999999);
	doh.registerUrl("dojox/storage/demos/helloworld.html", dojo.moduleUrl("dojox","storage/demos/helloworld.html"+userArgs), 99999999);
	doh.registerUrl("dojox/storage/tests/test_storage.html", dojo.moduleUrl("dojox","storage/tests/test_storage.html"+userArgs), 99999999);
	doh.registerUrl("dojox/string/tests/BuilderPerf.html", dojo.moduleUrl("dojox","string/tests/BuilderPerf.html"+userArgs), 99999999);
	doh.registerUrl("dojox/string/tests/peller.html", dojo.moduleUrl("dojox","string/tests/peller.html"+userArgs), 99999999);
	doh.registerUrl("dojox/string/tests/PerfFun.html", dojo.moduleUrl("dojox","string/tests/PerfFun.html"+userArgs), 99999999);
	doh.registerUrl("dojox/timing/tests/test_Sequence.html", dojo.moduleUrl("dojox","timing/tests/test_Sequence.html"+userArgs), 99999999);
	doh.registerUrl("dojox/timing/tests/test_ThreadPool.html", dojo.moduleUrl("dojox","timing/tests/test_ThreadPool.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/demo_FisheyeList-orig.html", dojo.moduleUrl("dojox","widget/tests/demo_FisheyeList-orig.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/demo_FisheyeList.html", dojo.moduleUrl("dojox","widget/tests/demo_FisheyeList.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/demo_FisheyeLite.html", dojo.moduleUrl("dojox","widget/tests/demo_FisheyeLite.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_ColorPicker.html", dojo.moduleUrl("dojox","widget/tests/test_ColorPicker.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_FisheyeList.html", dojo.moduleUrl("dojox","widget/tests/test_FisheyeList.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_FisheyeLite.html", dojo.moduleUrl("dojox","widget/tests/test_FisheyeLite.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_Iterator.html", dojo.moduleUrl("dojox","widget/tests/test_Iterator.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_Loader.html", dojo.moduleUrl("dojox","widget/tests/test_Loader.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_MultiComboBox.html", dojo.moduleUrl("dojox","widget/tests/test_MultiComboBox.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_Rating.html", dojo.moduleUrl("dojox","widget/tests/test_Rating.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_SortList.html", dojo.moduleUrl("dojox","widget/tests/test_SortList.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_TimeSpinner.html", dojo.moduleUrl("dojox","widget/tests/test_TimeSpinner.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_Toaster.html", dojo.moduleUrl("dojox","widget/tests/test_Toaster.html"+userArgs), 99999999);
	doh.registerUrl("dojox/widget/tests/test_Wizard.html", dojo.moduleUrl("dojox","widget/tests/test_Wizard.html"+userArgs), 99999999);
	doh.registerUrl("dojox/wire/demos/markup/demo_ActionChaining.html", dojo.moduleUrl("dojox","wire/demos/markup/demo_ActionChaining.html"+userArgs), 99999999);
	doh.registerUrl("dojox/wire/demos/markup/demo_ActionWiring.html", dojo.moduleUrl("dojox","wire/demos/markup/demo_ActionWiring.html"+userArgs), 99999999);
	doh.registerUrl("dojox/wire/demos/markup/demo_BasicChildWire.html", dojo.moduleUrl("dojox","wire/demos/markup/demo_BasicChildWire.html"+userArgs), 99999999);
	doh.registerUrl("dojox/wire/demos/markup/demo_BasicColumnWiring.html", dojo.moduleUrl("dojox","wire/demos/markup/demo_BasicColumnWiring.html"+userArgs), 99999999);
	doh.registerUrl("dojox/wire/demos/markup/demo_ConditionalActions.html", dojo.moduleUrl("dojox","wire/demos/markup/demo_ConditionalActions.html"+userArgs), 99999999);
	doh.registerUrl("dojox/wire/demos/markup/demo_FlickrStoreWire.html", dojo.moduleUrl("dojox","wire/demos/markup/demo_FlickrStoreWire.html"+userArgs), 99999999);
	doh.registerUrl("dojox/wire/demos/markup/demo_TopicWiring.html", dojo.moduleUrl("dojox","wire/demos/markup/demo_TopicWiring.html"+userArgs), 99999999);
	doh.registerUrl("dojox/_sql/demos/customers/customers.html", dojo.moduleUrl("dojox","_sql/demos/customers/customers.html"+userArgs), 99999999);
}
}catch(e){
	doh.debug(e);
}
