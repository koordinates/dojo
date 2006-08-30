

(ogre/compose "classes.htm" "classes.htm")

(ogre/compose "nodes.htm" "nodes.htm")

(ogre/compose "loaders.htm" "loaders.htm")

(ogre/compose "extensions.htm" "extensions.htm")

(ogre/compose "overview.htm" "overview.htm")

(ogre/compose "overview-classes.htm" "overview-classes.htm")

(ogre/compose "overview-nodes.htm" "overview-nodes.htm")

(ogre/compose "overview-extensions.htm" "overview-extensions.htm")

(ogre/compose "overview-loaders.htm" "overview-loaders.htm")

(ogre/compose "index.htm" "index.htm")
(ogre/compose "index.htm" "index.html")

(map (lambda (ogobject)
	(ogre/compose "ClassTemplate.htm" "@ClassCompositeName@.htm" ogobject))
     (ogre/get-classes))

(map (lambda (ogobject)
	(ogre/compose "NodeTemplate.htm" "@NodeCompositeName@.htm" ogobject))
     (ogre/get-nodes))

(map (lambda (ogobject)
	(ogre/compose "LoaderTemplate.htm" "@LoaderCompositeName@.htm" ogobject))
     (ogre/get-loaders))

(map (lambda (ogobject)
	(ogre/compose "ExtensionTemplate.htm" "@ExtCompositeName@.htm" ogobject))
     (ogre/get-extensions))

(let ((count 0))
	(map (lambda (bucket)
		(set! count (+ count 1))
		(ogre/compose-bucket "IndexBucketTemplate.htm" 
				(string-append "index-" (number->string count) ".htm") bucket))
	(ogre/get-buckets)))

(ogre/copy-file "ogredoc.css" "ogredoc.css")

(ogre/copy-file "ogrelite.jpg" "ogrelite.jpg")

(ogre/copy-file "menu.htm" "menu.htm")

(ogre/copy-file "help-doc.htm" "help-doc.htm")







