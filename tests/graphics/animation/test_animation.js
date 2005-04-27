dojo.hostenv.loadModule("dojo.graphics.animation.Animation");


function test_animation_packagefile(){
	jum.assertTrue("test1", typeof dojo.graphics=="object");
	jum.assertTrue("test1", typeof dojo.graphics.animation=="object");
	jum.assertTrue("test1", typeof dojo.graphics.animation.Animation=="object");
	jum.assertTrue("test1", typeof dojo.graphics.animation.AnimationEvent=="object");
}
