dojo.hostenv.loadModule("dojo.graphics.animation.Animation");


function test_animation_packagefile(){
	jum.assertEquals("test1", typeof dojo.graphics, "object");
	jum.assertEquals("test2", typeof dojo.graphics.animation, "object");
	jum.assertEquals("test3", typeof dojo.graphics.animation.Animation, "function");
	jum.assertEquals("test5", typeof dojo.graphics.animation.AnimationEvent, "function");
}
