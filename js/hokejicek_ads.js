(function(){
  var ADS_DELAY = 2000;
  var SCRIPT_ID = 'aclib-script';
  var ZONE_ID = 'zitkptgwk8';
  var adsEnabled = true;
  var timer = null;

  function disableAds(){
    adsEnabled = false;
    if (timer){
      clearTimeout(timer);
      timer = null;
    }
  }

  function triggerAdblock(reason){
    disableAds();
    console.warn('[HOKEJICEK ADS] Adblock detected:', reason);
    try{
      window.dispatchEvent(new CustomEvent('hokejicek:adblock', {detail:{reason:reason}}));
    }catch(err){}
  }

  function injectPopup(){
    if (!adsEnabled) return;

    if (typeof aclib !== 'undefined' && aclib && typeof aclib.runAutoTag === 'function'){
      try{
        aclib.runAutoTag({zoneId: ZONE_ID});
      }catch(err){
        console.warn('[HOKEJICEK ADS] runAutoTag failed');
        triggerAdblock('run-failed');
      }
      return;
    }

    setTimeout(function(){
      if (!adsEnabled) return;

      if (typeof aclib !== 'undefined' && aclib && typeof aclib.runAutoTag === 'function'){
        try{
          aclib.runAutoTag({zoneId: ZONE_ID});
        }catch(err2){
          console.warn('[HOKEJICEK ADS] runAutoTag retry failed');
          triggerAdblock('retry-failed');
        }
      }else{
        triggerAdblock('missing-aclib');
      }
    }, 250);
  }

  function loadScript(callback){
    if (!adsEnabled) return;

    var existing = document.getElementById(SCRIPT_ID);
    if (existing){
      existing.addEventListener('load', callback, {once:true});
      if (existing.dataset.loaded === 'true'){
        callback();
      }
      return;
    }

    var script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = '//acscdn.com/script/aclib.js';
    script.async = true;

    script.onload = function(){
      script.dataset.loaded = 'true';
      setTimeout(callback, 0);
    };

    script.onerror = function(){
      console.warn('[HOKEJICEK ADS] ACLIB blocked');
      triggerAdblock('script-blocked');
    };

    document.head.appendChild(script);
  }

  timer = setTimeout(function(){
    loadScript(injectPopup);
  }, ADS_DELAY);

})();
