// This is the demos-all profile, which mimics the nightly checkout/build profile, but adds in the demos/
// repo for easy debugging. We are not to link to the demos in nightly in a static fashion, but rather use
// this repo as a testing place for versioned demos to be pushed onto dojotoolkit.org
dependencies = {

	action:"clean,release",
	optimize:"shrinksafe",
	cssOptimize:"comments.keepLines",
	releaseName:"demosite",
	mini:"false",

	layers: [
		// standard:
		{
			name: "../dijit/dijit.js",
			dependencies: [
				"dijit.dijit"
			]
		},
		{
			name: "../dijit/dijit-all.js",
			layerDependencies: [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dijit.dijit-all"
			]
		},

		// Here are the various demos with promotion:
		{
			name: "../demos/editor/layer.js",
			dependencies: [
				"dijit.layout.BorderContainer",
				"dijit.layout.ContentPane",
				"dijit.layout.AccordionContainer",
				"dijit.layout.ContentPane",
				"dojox.fx.text",
				"dijit.Editor",
				"dijit._editor.plugins.FullScreen",
				"dijit._editor.plugins.LinkDialog",
				"dijit._editor.plugins.Print",
				"dijit._editor.plugins.ViewSource",
				"dijit._editor.plugins.FontChoice",
				"dijit._editor.plugins.NewPage",
				"dijit._editor.plugins.ToggleDir",
				"dojox.editor.plugins.ShowBlockNodes",
				"dojox.editor.plugins.ToolbarLineBreak",
				"dojox.editor.plugins.Save",
				"dojox.editor.plugins.InsertEntity",
				"dojox.editor.plugins.Preview",
				"dojox.editor.plugins.PageBreak",
				"dojox.editor.plugins.PrettyPrint",
				"dojox.editor.plugins.NormalizeIndentOutdent",
				"dojox.editor.plugins.FindReplace",
				"dojox.editor.plugins.Breadcrumb",
				"dojox.editor.plugins.TextColor",
				"dojox.editor.plugins.CollapsibleToolbar",
				"dojox.editor.plugins.Blockquote",
				"dojox.editor.plugins.PasteFromWord",
				"dojox.editor.plugins.InsertAnchor",
				"dojox.editor.plugins.TablePlugins",
				"dojox.editor.plugins.PasteFromWord",
				"dojox.editor.plugins.Smiley",
				"dojox.editor.plugins.NormalizeStyle",
				"dojox.editor.plugins.StatusBar"
			]
		},
		{
			// the dojo.moj.oe demo
			name: "../demos/mojo/src.js",
			dependencies: [
				"demos.mojo.src"
			]
		},
		{
			// the dojo.workers() demo
			name: "../demos/skew/src.js",
			dependencies: [
				"demos.skew.src"
			]
		},
		{
			// the mail app demo
			name: "../demos/mail/src.js",
			dependencies: [
				"demos.mail.src"
			]
		},
		{
			// the i18n / flags demo
			name: "../demos/i18n/src.js",
			dependencies: [
				"demos.i18n.src"
			]
		},
		{
			// the FlashCard demo
			name: "../demos/flashCards/src.js",
			dependencies: [
				"demos.flashCards.src"
			]
		},
		{
			// the CastleParty demo
			name: "../demos/castle/src.js",
			dependencies: [
				"demos.castle.src"
			]
		},
		{
			// the Image Preview demo:
			name: "../demos/cropper/src.js",
			dependencies:[
				"demos.cropper.src"
			]
		},
		{
			// the Survey demo
			name: "../demos/survey/src.js",
			dependencies:[
				"demos.survey.src"
			]
		},
		{
			// the BabelChat demo
			name: "../demos/babelChat/src.js",
			dependencies:[
				"demos.babelChat.src"
			]
		},
		{
			name: "../demos/faces/src.js",
			dependencies:[
				"demos.faces.src"
			]
		},
        {
        name: "../demos/mobileMvc/src.js",
			dependencies:[
				"demos.mobileMvc.src"
			]
		},
		{
			name: "../demos/mobileGauges/src.js",
			dependencies:[
				"demos.mobileGauges.src"
			]
		},
		{
			name: "../demos/mobileCharting/src.js",
			dependencies:[
				"demos.mobileCharting.src"
			]
		},
		{
			name: "../demos/mobileGeoCharting/src.js",
			dependencies:[
				"demos.mobileGeoCharting.src"
			]
		},
		{
			name: "../demos/mobileFileBrowser/src.js",
			dependencies:[
				"demos.mobileFileBrowser.src"
			]
		},
		{
			name: "../demos/mobileOpenLayers/src.js",
			dependencies:[
				"demos.mobileOpenLayers.src"
			]
		},
		{
			name: "../demos/mobileGallery/src.js",
			dependencies:[
				"demos.mobileGallery.src"
			]
		},
		{
			name: "../demos/touch/src.js",
			dependencies:[
				"demos.touch.src"
			]
		},
		{
			// the CSS3 animations demo
			name: "../demos/css3/src.js",
			dependencies:[
				"demos.css3.src"
			]
		},
		// Gridx demo
		{
			name: "../demos/gridx/MiniGrid.js",
			dependencies: [
				"demos.gridx.MiniGrid"
			]
		},
		{
			name: "../demos/gridx/MobileGrid.js",
			resourceName: "demos.gridx.MobileGrid",
			dependencies: [
				"demos.gridx.MobileGrid"
			]
		},
		{
			name: "../demos/gridx/AdvancedGrid.js",
			dependencies: [
				"demos.gridx.AdvancedGrid"
			]
		}
	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ],
		[ "demos", "../demos" ]
	]
}
