var lucidfind = {
  cookie: {
    create: function(name, value, days) {
      if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
      }
      else var expires = "";
      document.cookie = name+"="+value+expires+"; path=/";

    },
    read: function(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length);
      }
      return null;
    }
  },
  current_request: null,
  facets: {},
  get_fq: function() {
    lucidfind.set_facets();
    var fq = [];
    var values = [];
    for ( facet in lucidfind.facets ) {
      fq.push(facet+':'+lucidfind.facets[facet].sort().join(','));
    }
    var out = fq.join('/');
    var sort = $('#page .results-summary select').val();
    if ( sort && sort.length > 0 ) { 
      if ( out.length > 0 ) { out = out + '/'; }
      out = out + 'sort:' +sort;
    }
    if (out.length > 0) { out = '/' + out; } else { out = '/n'; /* hack to work when no boxes are selected */ }
    return out;
  },
  get_param: function( param ) {
    var components = window.location.pathname.split('/');
    for ( i in components ) {
      components[i] = components[i].split(':');
    }
    params = {};
    for ( i in components ) {
      if ( components[i].length > 0 ) {
        params[components[i][0]] = components[i][1];
      }
    }
    var query = window.location.search.substr(1).split('&');
    for ( i in query ) {
      query[i] = query[i].split('=');
    }
    for ( i in query ) {
      if ( query[i].length > 0 ) {
        params[query[i][0]] = query[i][1];
      }
    }
    if ( params[param] ) {
      return params[param];
    } else {
      return '';
    }
  },
  historical: false,
  history: function( hash ) {
    if ( hash != '' ) {
      lucidfind.historical = true;
      lucidfind.refresh(hash, false);
    } else if ( lucidfind.historical ) {
      lucidfind.refresh(lucidfind.original_fq, true);
    }
  },
  original_fq: '',
  refresh: function( fq, paged ) {
    $("#main").removeClass('original');
    $("#main .results h2").text('Updating Results...');
    $("#main .results-summary, #main ol").hide();
    $("#main .spinner").show();
    if ( fq == '/n' ) {
      fq = ''; /* undo hack */
    }
    var url = lucidfind.search_url+'/ajax:true'+fq;
    if ( paged ) {
      var page = window.location.href.replace(/.*page:(\d+).*/, '$1');
      if ( parseInt(page) ) {
        url = url + '/page:' + page;
      }
    }
    if ( lucidfind.get_param('q') ) {
      url = url + '?q=' + lucidfind.get_param('q');
    }
    if ( lucidfind.current_request ) {
      lucidfind.current_request.abort();
    }
    $('#search').attr('action', lucidfind.search_url+fq);
    lucidfind.current_request = $.get(url, {}, function(responseText, textStatus, XMLHttpRequest) {
      $('#main').html(responseText);
      lucidfind.set_bindings();
      lucidfind.current_request = null;
      
      /* update links, etc., throughout the page */
      $('#main-query .permalink').html('<a href="'+lucidfind.search_url+fq+'?'+'q='+lucidfind.get_param('q')+'">Link to current search</a>');
      $('#main-query .new-search a').text('Start new search');
      $('#q').val(decodeURIComponent(lucidfind.get_param('q')).replace(/\+/g, ' '));
    });
  },
  set_bindings: function() {
    $('#page .results-summary select').removeAttr('name').unbind('change').change( function() {
      $.history.load(lucidfind.get_fq());
      return false;
    });
    $('#page .preferences h2').unbind('click').click( function() {
      $(this).parent().children('ul').slideToggle();
    });
    $('#page #show_zeros').unbind('click').click( function() {
      if ( this.checked ) {
        lucidfind.cookie.create('_lf_show_zeros', 'true', 100);
        $('#page .facets .zero').show();
      } else {
        lucidfind.cookie.create('_lf_show_zeros', '', -1);
        $('#page .facets .zero').not('.active').hide();
      }
    });
    $('#page #results_per_page').unbind('change').change( function() {
      lucidfind.cookie.create('_lf_results_per_page', $(this).val(), 100);
      $.history.load(lucidfind.get_fq());
    });
    if ( lucidfind.cookie.read('_lf_show_zeros') == 'true' ) {
      $('#search .facets .zero').css('display', 'list-item');
      $('#page #show_zeros').each( function() { this.checked = true; } );
    }
    if ( lucidfind.cookie.read('_lf_results_per_page') ) {
      $('#page #results_per_page').val(lucidfind.cookie.read('_lf_results_per_page'));
    }
    $('#page .facet-controls .clear-facet').unbind('click').click( function() {
      $('#page .facets :checkbox').each( function() {
        this.checked = false;
      });
      $.history.load(lucidfind.get_fq());
      return false;
    });
    $('#page .facets .clear-facet').unbind('click').click( function() {
      $(this).parent().parent().find(':checkbox').each( function() {
        this.checked = false;
      });
      $.history.load(lucidfind.get_fq());
      return false;
    });
    $('#page .facets ul :checkbox').unbind('click').click( function() {
      $.history.load(lucidfind.get_fq());
    });
    $('#s-email').parent().find('ul :checkbox').unbind('click').click( function() {
      if ( this.checked ) {
        if ( !$('#s-email')[0].checked ) {
          $('#s-email')[0].checked = true;
        }
      }
      $.history.load(lucidfind.get_fq());
    });
    $('#li-blogs, #li-cdrg, #li-site').unbind('click').click( function() {
      if ( this.checked ) {
        if ( !$('#s-lucid')[0].checked ) {
          $('#s-lucid')[0].checked = true;
        }
      }
      $.history.load(lucidfind.get_fq());
    });
    $('#i-closed, #i-open, #i-issue, #i-comment').unbind('click').click( function() {
      if ( this.checked ) {
        if ( !$('#s-issues')[0].checked ) {
          $('#s-issues')[0].checked = true;
        }
      }
      $.history.load(lucidfind.get_fq());
    });
    $('#s-issues, #s-email, #s-lucid').unbind('click').click( function() {
      if ( !this.checked ) {
        $(this).parent().find('ul :checkbox').each( function() {
          this.checked = false;
        });
      }
      $.history.load(lucidfind.get_fq());
    });
  },
  set_facets: function() {
    lucidfind.facets = {};
    var facet;
    var value;
    $('#main .facets ul :checkbox').each( function() {
      if ( this.checked ) {
        facet = $(this).attr('value').split(":")[0];
        value = $(this).attr('value').split(":")[1];
        if ( facet != '' && value != '' ) {
          if ( lucidfind.facets[facet] ) {
            lucidfind.facets[facet].push(value);
          } else {
            lucidfind.facets[facet] = [value];
          }
        }
      }
    });
  }
};
$(document).ready( function() {
  $('#main').addClass('original');
  lucidfind.original_fq = lucidfind.get_fq();
  var fq = lucidfind.original_fq;
  if ( fq == '/n' ) { fq = ''; }
  $('#search').attr('action', lucidfind.search_url+fq);
  $.history.init(lucidfind.history);
  lucidfind.set_facets();
  lucidfind.set_bindings();
  if ( lucidfind.get_param('q') == '' && fq == '/n' ) {
    $('#main-query .new-search a').text('');
  }
  if ( lucidfind.get_param('q') == '' ) {
    $('#q').val(lucidfind.app_title).focus( function() {
      $(this).unbind('focus').unbind('click').val('');
      $('#main-query .submit').unbind('click').val('');
    }).click( function() {
      $(this).unbind('focus').unbind('click').val('');
      $('#main-query .submit').unbind('click').val('');
    });
    $('#main-query .submit').click( function() {
      $('#q').unbind('focus').unbind('click').val('');
      $(this).unbind('click').val('');
    });
  }
});