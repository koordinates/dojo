How the dojo-driven Doc Tool Will Work
======================================

This is only for starters, to give you a good idea of how things are going down, and to give me a good idea of building practical JSON objects. Enjoy!

JSON Objects
------------

* The "function_name" JSON object has a list of packages (eg that which is called by dojo.require) and the methods associated with that package.

* Each file in the pkg_meta directory is listed by package and has the following structure:
** requires->*hostenv*->packages
** function signatures (each function signature could have an 'is' key that points to another function) and their descriptions.

Searching docs
--------------

Searching docs requires the following options:

* Search Box
* Hostenv
* Extra environmental options

Search Box
----------

This is an autocompleting search box. The values used for autocomplete are found in the "function_name" JSON object in the second level of the object. (eg the values of each value). As the user types, as long as the entered text matches "dojo." then we limit the autocomplete to functions within the dojo namespace. If this is not true, it searches the entire list.

Hostenv Options
---------------

A dropdown with hostenvs

Extra environmental options
---------------------------

The options that aren't set by hostenv (eg "browser" hostenv implies "html" as an option) can be chosen here (eg svg).

Results
-------

If the user has searched for something that has an exact match in the method list, then we do the following:

* First check to see if the method has source in the fnc_src directory (this can be neglected by dojo.package.* stuff). If it does, display a method page. Everything below can be skipped at this point.
* Check for package metadata in the pkg_meta directory. Check to see if the file requires other files. Display to the user a list of methods with their descriptions. Allow the user to click each method.

If the user has searched for something that has a partial match in the method list, then we do the following:

Go through each matching method in the list, load the pkg_meta for each package and display function signatures and descriptions for all matching methods. Allow the user to click each method.