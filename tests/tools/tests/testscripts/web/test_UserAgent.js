function test_UserAgent_atts() {
  if (typeof navigator == 'undefined') {jum.untested('UserAgent.atts'); return;}

  var ua = navigator.userAgent.toLowerCase();

  var mess = ' navigator.userAgent=' + navigator.userAgent + "\n" +
         ' family_=' +              bu_UA.family_ +
         ' brand_=' +               bu_UA.brand_ +
         ' version_=' +             bu_UA.version_ +
         ' gecko_version_=' +       bu_UA.gecko_version_ +
         ' generation_=' +          bu_UA.generation_ +
         ' os_=' +                  bu_UA.os_ + "\n" +
         ' typeof(version_)=' +          (typeof bu_UA.version_) + "\n" +
         ' typeof(gecko_version_)=' +    (typeof bu_UA.gecko_version_) + "\n" +
         ' bug_set_style_attribute()=' + bu_UA.bug_set_style_attribute() + "\n" +
         ' bug_create_iframe()=' +       bu_UA.bug_create_iframe() + "\n" +
         ' bug_iframe_display_none()=' + bu_UA.bug_iframe_display_none() + "\n" +
         ' can_iframe_onload_dyn()=' +   bu_UA.can_iframe_onload_dyn() + "\n" +
         '';
  // bu_alert(mess);
  //khtml has '(like Gecko)' in its ua string
  if (ua.indexOf('gecko') != -1 && ua.indexOf('safari') == -1) jum.assertEquals('family', BU_UA_FAMILY_GECKO, bu_UA.family_);
}