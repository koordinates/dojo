dojo.provide("dojo.widget.SpanSelect");

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");

/**
 * a span, once clicked turns into select and allows editing this way
 */
dojo.widget.defineWidget(
	"dojo.widget.SpanSelect",
	dojo.widget.HtmlWidget,
	function() {
		/**
		 * make sure selectOptions is not static
		 */
		this.selectOptions = {}
	},
	{
		isContainer: true,
		
		templatePath: dojo.uri.moduleUri("dojo.widget", "templates/SpanSelect.html"),
		templateCssPath: dojo.uri.moduleUri("dojo.widget", "templates/SpanSelect.css"),
		
		/**
		 * select options hash
		 */
		selectOptions: {},
		
		spanContent: "",
		
		spanNode: null,
		selectNode: null,
		
		
		postCreate: function() {
			this.fillSelectValues()
		},
		
		/**
		 * cleans select node and fills with options from selectOptions
		 * 
		 */
		fillSelectValues: function() {
			this.selectNode.innerHTML = ''
			for(var key in this.selectOptions) {
				var option = document.createElement("option")
				option.setAttribute("value", key)
				option.innerHTML = this.selectOptions[key]
				this.selectNode.appendChild(option)
			}
		},
		
		onSelectChange: function(/*Event*/ evt){
			var optionSelected = this.selectNode.options[this.selectNode.selectedIndex]			
			this.spanNode.innerHTML = optionSelected.textContent || optionSelected.innerText || optionSelected.innerHTML
			this.showSpan()
		},
		
		onSelectBlur: function(/*Event*/ evt){			
			this.showSpan()
		},
		
		/**
		 * switch to select
		 * set its selectedIndex to current span value if possible
		 */
		showSelect: function() {
			for(var i=0; i<this.selectNode.options.length; i++) {
				var option = this.selectNode.options[i]
				if (option.text == this.spanNode.innerHTML) {
					this.selectNode.selectedIndex = i
					break
				}
			}
			this.spanNode.style.display = 'none'
			this.selectNode.style.display = ''
			this.selectNode.focus()
		},
		
		
		/**
		 * switch to span
		 */
		showSpan: function() {
			this.spanNode.style.display = ''
			this.selectNode.style.display = 'none'
		},
		
		onSpanClick: function(/*Event*/ evt){
			this.showSelect()
		}
		
	}
);	
		
		