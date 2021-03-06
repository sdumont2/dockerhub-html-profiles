(function(d) {
  var baseUrl = "https://sdumont2.github.io/dockerhub-html-profiles/dist/";

  function getElementArrayByClass(name) {
    if (d.querySelectorAll) {
      return d.querySelectorAll('.' + name);
    }
    var elements = d.getElementsByTagName('div');
    var ret = [];
    for (var i = 0; i < elements.length; i++) {
      if (~elements[i].className.split(' ').indexOf(name)) {
        ret.push(elements[i]);
      }
    }
    return ret;
  }

  function getElementAttribute(element, name) {
    return element.getAttribute('profile-' + name);
  }

  function supportPassiveCheck() { //https://www.chromestatus.com/feature/5745543795965952
    var supportsPassive = false;
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
        }
      });
      window.addEventListener("testPassive", null, opts);
      window.removeEventListener("testPassive", null, opts);
    } catch (e) {}
    return supportsPassive;
  }

  function getPassiveResult(){
    return supportPassiveCheck() ? { passive: true } : false;
  }

  function messageListener(iframe) {
    if (window.addEventListener) {
      window.addEventListener('message', function(e) {
        if (iframe.id === e.data.sender) {
          iframe.height = e.data.height;
        }
      }, getPassiveResult());
    }
  }

  function renderProfile(profileElement) {
    var theme = getElementAttribute(profileElement, 'theme') || 'default';
    var profileUrl = baseUrl + 'themes/' + theme + '.html';
    
    var user = getElementAttribute(profileElement, 'user');
    if (!user) {
      return;
    }

    var width = getElementAttribute(profileElement, 'width') || 400;
    var height = getElementAttribute(profileElement, 'height') || 400;
    height = (height > 400) ? height : 400;

    var iframeId = user + width + height + theme;

    var iframe = d.createElement('iframe');
    iframe.setAttribute('id', iframeId);
    iframe.setAttribute('frameborder', 0);
    iframe.setAttribute('scrolling', 0);
    iframe.setAttribute('allowtransparency', true);

    var url = profileUrl + '?user=' + user + '&iframeId=' + iframeId;

    iframe.src = url;
    iframe.width = width;
    iframe.height = height;
    
    messageListener(iframe);
    profileElement.parentNode.replaceChild(iframe, profileElement);
    return iframe;
  }

  var profileArray = getElementArrayByClass('dockerhub-profile');
  for (var i = 0; i < profileArray.length; i++) {
    renderProfile(profileArray[i]);
  }

})(document);