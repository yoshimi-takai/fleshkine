(function($) {
  'use strict';

  let App = {
    $win: $(window),
    $html: $(document.documentElement)
  };

  let Sub = {
    percentage: function(x) {
      return x + '%';
    },
    dataObj: function(name) {
      return sprintf('[data-obj~="%s"]', name);
    },
    getTranslateY: function($elem) {
      let transform = $elem.css('transform');
      if (transform == null) return 0;
      let m = transform.split(/[()]/);
      let values = m[1] != null ? m[1].split(/\s*,\s*/) : null;
      let functionName = m[0];
      // matrix(a, b, c, d, tx, ty)
      if (functionName === 'matrix') return Number(values[5]);
      // matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1)
      if (functionName === 'matrix3d') return Number(values[13]);
      return 0;
    },
    getAdjacentElementsCount: function($elem, selector) {
      let count = 0;
      let $prevElems = $elem.prevAll();
      $prevElems.each(function() {
        let $prevElem = $(this);
        if (!$prevElem.is(selector)) return;
        ++count;
      });
      return count;
    },
    targetEffectInit: function($elems) {
      $elems.each(function() {
        let $elem = $(this);
        if ($elem.is(Sub.dataObj('page-load'))) {
          $elem.css({
            opacity: 0
          });
        }
        if ($elem.is(Sub.dataObj('fade'))) {
          $elem.css({
            opacity: 0
          });
        }
        if ($elem.is(Sub.dataObj('move'))) {
          $elem.css({
            opacity: 0,
            transform: 'translate(0, 30px)'
          });
        }
        if ($elem.is(Sub.dataObj('meter'))) {
          $elem.css({
            width: 0
          });
        }
      });
    },
    targetEffectFinish: function($elems) {
      $elems.each(function() {
        let $elem = $(this);
        $elem.on('transitionend', function() {
          let style = $elem.attr('data-style');
          if (style != null) {
            $elem.attr('style', style).removeAttr('data-style');
          }
          else {
            $elem.removeAttr('style');
          }
          //$elem.removeAttr('data-obj');
        });
        if ($elem.is(Sub.dataObj('page-load'))) {
          $elem.css({
            opacity: 1,
            transition: 'all 1s ease'
          });
        }
        if ($elem.is(Sub.dataObj('fade'))) {
          $elem.css({
            opacity: 1,
            transition: 'all 4s cubic-bezier(0.190, 1.000, 0.220, 1.000)'
          });
        }
        if ($elem.is(Sub.dataObj('move'))) {
          let adjacentCount = Sub.getAdjacentElementsCount($elem, Sub.dataObj('move'));
          let baseDelay = Number($elem.closest('[data-delay]').attr('data-delay')) || 300;
          let delay = adjacentCount * baseDelay;
          $elem.css({
            opacity: 1,
            transform: 'translate(0, 0)',
            transition: 'all 0.8s ease',
            'transition-delay': delay + 'ms'
          });
        }
        if ($elem.is(Sub.dataObj('meter'))) {
          let percentage = Sub.percentage($elem.closest('[data-meter]').attr('data-meter'));
          $elem.css({
            width: percentage,
            transition: 'all 1s ease'
          });
          $elem.attr('data-style', sprintf('width: %s', percentage));
        }
      });
    },
    targetEffectFire: function($elems, delay) {
      if (delay == null) delay = 0;
      if ($elems.attr('data-state') === 'fire') return;
      $elems.attr('data-state', 'fire');
      setTimeout(function() {
        $elems.removeAttr('data-state');
        Sub.targetEffectFinish($elems);
      }, delay);
    }
  };

  let Init = {
    loadedEffect: function() {
      let $elem = App.$html;
      $elem.attr('data-obj', 'page-load');
      Sub.targetEffectInit($elem);
      Sub.targetEffectFire($elem, 500);
    }
  };

  let Proc = {
    meteredList: function() {
      $('.meteredList').each(function() {
        setMeteredList($(this));
      });
      function setMeteredList($target) {
        $target.children().each(function() {
          setMeterItem($(this));
        });
      }
      function setMeterItem($target) {
        const value = Number($target.attr('data-meter')) || 0;
        let $meterContainer = $('<span class="meterContainer">');
        let $meterValue = $('<span class="meterValue">').appendTo($meterContainer);
        $meterValue.css('width', Sub.percentage(value));
        $target.append($meterContainer);
      }
    },
    objEffect: function() {
      let firstViewEffectDelay = 1000;
      let effectDelay = 300;

      let $objEffectTargets = getEffectTargets();
      Sub.targetEffectInit($objEffectTargets);

      scrollPositionObserver(firstViewEffectDelay);
      App.$win.on('scroll', function() {
        scrollPositionObserver(effectDelay);
      });

      function getEffectTargets() {
        $(Sub.dataObj('move-list')).each(function() {
          let $elem = $(this);
          let attrValue = $elem.attr('data-obj');
          let $listItems = $elem.children();
          $listItems.attr('data-obj', sprintf('move %s', attrValue));
        });
        $(Sub.dataObj('meter-list')).each(function() {
          let $elem = $(this);
          let attrValue = $elem.attr('data-obj');
          let $meterItems = $elem.find('.meterValue');
          $meterItems.attr('data-obj', sprintf('meter %s', attrValue));
        });

        let $dataObj = $('[data-obj]');
        return $dataObj;
      }
      function scrollPositionObserver(delay) {
        let wTop = App.$win.scrollTop();
        let wBottom = wTop + App.$win.height();

        $objEffectTargets.each(function() {
          let $elem = $(this);
          let list = $elem.is(Sub.dataObj('move-list')) || $elem.is(Sub.dataObj('meter-list'));;
          let timing = $elem.is(Sub.dataObj('timing'));
          let $posElem = list ? $elem.parents('[data-obj]').eq(0) : $elem;
          let eTop = $posElem.offset().top - Sub.getTranslateY($posElem);
          let eHeight = $posElem.outerHeight();
          let eBottom = eTop + eHeight;
          let listAdjust = list ? Math.min(eHeight, 100) : 0;
          let checkPos = timing ? listAdjust + eTop : eBottom;
          if (checkPos < wBottom) {
            Sub.targetEffectFire($elem, delay);
            $objEffectTargets = $objEffectTargets.not($elem);
          }
        });
      }
    }
  };

  $.each(Init, function(key, proc) {
    proc();
  });
  $(function() {
    $.each(Proc, function(key, proc) {
      proc();
    });
  });
  function sprintf(format, args) {
    var p = 1, params = arguments;
    return format.replace(/%./g, function(m) {
      if (m === '%%') return '%';
      if (m === '%s') return params[p++];
      return m;
    });
  }
}(jQuery));
