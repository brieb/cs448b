var display_college_results;
var select_college;
var school_has_majors;
var school_has_name;
var update_url;
var read_url;

$(document).ready(function() {
  var API_URL = '../api/college.php';

  var tok_match_college = [];
  var tok_match_major = [];
  var tok_specified_major = [];
  var tok_specified_college = [];

  var tok_college_on_change = function(callback) {
    tok_specified_college = tok_college.tokenInput('get');
    tok_match_college = tok_college.tokenInput('get');
    callback();
  };
  var tok_college_on_add = function() {
    tok_college_on_change(nameAdded);
  };
  var tok_college_on_delete = function() {
    tok_college_on_change(nameRemoved);
  };

  var tok_major_on_change = function(callback) {
    tok_specified_major = tok_major.tokenInput('get');

    var major_ids = [];
    for (var i = 0; i < tok_specified_major.length; i++) {
      major_ids.push(tok_specified_major[i].id);
    }

    $.get(
      '../api/get_colleges_by_majors.php',
      {major_ids:major_ids},
      function(response) {
        tok_match_major = response;
        callback();
      });
  };
  var tok_major_on_add = function() {
    tok_major_on_change(majorAdded);
  };
  var tok_major_on_delete = function() {
    tok_major_on_change(majorRemoved);
  };

  school_has_majors = function(school) {
    if (tok_match_major === null || tok_match_major.length === 0) {
      return null;
    }

    school.id = parseInt(school.id);
    for (var i = 0; i < tok_match_major.length; i++) {
      if (parseInt(tok_match_major[i].college_id) === school.id) {
        tok_match_major[i].college_id =
          parseInt(tok_match_major[i].college_id);
        tok_match_major[i].num_majors =
          parseInt(tok_match_major[i].num_majors);
        tok_match_major[i].num_majors_specified =
          parseInt(tok_match_major[i].num_majors_specified);
        return tok_match_major[i];
      }
    }

    return {
      college_id:school.id,
      num_majors:0,
      num_majors_specified:tok_specified_major.length
    };
  };
  school_has_name = function(school) {
    if (num_school_names_specified() === 0) {
      return true;
    }

    for (var i = 0; i < tok_match_college.length; i += 1) {
      if (tok_match_college[i].name === school.name) {
        return true;
      }
    }

    return false;
  };
  num_school_names_specified = function() {
    return tok_specified_college.length;
  };


  var tok_college = $("#tok_college").tokenInput(
    '../api/college_name.php',
    {
      minChars: 2,
      preventDuplicates: true,
      prePopulate: [],
      animateDropdown: false,
      hintText: "Type in a college name",
      theme: "facebook",
      onAdd: tok_college_on_add,
      onDelete: tok_college_on_delete
    }
  );

  var tok_major = $("#tok_major").tokenInput(
    '../api/major.php',
    {
      minChars: 2,
      preventDuplicates: true,
      prePopulated: [
        {"id":"126","name":"Curriculum\/Instruction"},
        {"id":"358","name":"Business Teacher Education"},
        {"id":"369","name":"Foreign Language & Literature - General"},
        {"id":"496","name":"Natural Resource Economics"},
        {"id":"522","name":"International Agriculture"},
        {"id":"525","name":"Architectural History\/Criticism"},
        {"id":"533","name":"Gay\/Lesbian Studies"},
        {"id":"534","name":"German Studies"},
        {"id":"535","name":"Near\/Middle Eastern Studies"},
        {"id":"544","name":"Biometrics"},
        {"id":"578","name":"Science, Technology & Society"},
        {"id":"917","name":"Bilingual\/Bicultural Education"},
        {"id":"945","name":"European Studies"},
        {"id":"948","name":"Latin American Studies"},
        {"id":"950","name":"Russian\/Slavic Area Studies"},
        {"id":"951","name":"Slavic Studies"},
        {"id":"972","name":"Greek, Ancient"},
        {"id":"983","name":"Ancient Studies\/Civilization"},
        {"id":"984","name":"Medieval\/Renaissance Studies"},
        {"id":"991","name":"Astrophysics"},
        {"id":"1196","name":"Analytical Chemistry"},
        {"id":"1208","name":"East Asian Studies"},
        {"id":"1285","name":"Communication Disorders"},
        {"id":"1305","name":"GeophysicsSeismology"},
        {"id":"1360","name":"Planetary Sciences"},
        {"id":"1427","name":"Engineering Science"},
        {"id":"1522","name":"Bacteriology"},
        {"id":"1525","name":"Cellular Biology\/Histology"},
        {"id":"1529","name":"Parasitology"},
        {"id":"1534","name":"Adult\/Continuing Teacher Education"},
        {"id":"1556","name":"Marine Engineering\/Naval Architecture"},
        {"id":"1558","name":"Ocean Engineering"},
        {"id":"1595","name":"Demography\/Population Studies"},
        {"id":"1682","name":"Atmospheric Sciences"},
        {"id":"1757","name":"Education of Multiple Handicapped"},
        {"id":"1872","name":"Actuarial Science"},
        {"id":"1903","name":"Forensic Chemistry"},
        {"id":"1904","name":"Industrial\/Organizational Psychology"},
        {"id":"1906","name":"Social Psychology"},
        {"id":"1988","name":"Paralegal\/Legal Assistance"},
        {"id":"2157","name":"Facial Treatments"},
        {"id":"2250","name":"Pharmaceutical Sciences"},
        {"id":"2351","name":"Spanish\/Iberian Studies"},
        {"id":"2356","name":"Botany"}
      ],
      animateDropdown: false,
      hintText: "Type in a major",
      theme: "facebook",
      onAdd: tok_major_on_add,
      onDelete: tok_major_on_delete
    }
  );

  var render_majors = function(majors) {
    var content = $('<table/>');
    content.append($('<thead/>').append(
      $('<th/>').text('Major'),
      $('<th/>').text('Type').addClass('col_type')
    ));
    for (var i = 0; i < majors.length; i += 1) {
      var major = majors[i];
      var types = major.degree_type.split(',');

      var types_cell = $('<td/>');
      var type_map = {
        'A': 'Associate degree',
        'B': 'Bachelor\'s degree',
        'C': 'Certificate or diploma'
      };
      for (var j = 0; j < types.length; j++) {
        var type = types[j];
        var type_label = j !== types.length-1 ? type + ',' : type;
        var type_title = type_map[type] === undefined ? '' : type_map[type];
        types_cell.append($('<acronym/>').text(type_label).attr('title', type_title));
      }

      var row = $('<tr/>');
      row.append($('<td/>').text(major.name.replace('/', ' / ')));
      row.append(types_cell);
      content.append(row);
    };
    return content;
  };

  addDataSelectionCallback(function(idx, is_from_result_list) {
    if (idx < 0) return;
    $.get(API_URL, {id: allData[idx].id}, function(response) {
      display_college_details(response);
      highlight_college_results_list_elem(
        $('#college_results_'+response.id), !is_from_result_list);
    });
  });

  var highlight_college_results_list_elem = function(elem, do_scroll) {
    var results_list = $('#college_results');
    results_list.find('ul li').removeClass('active');
    elem.addClass('active');

    if (do_scroll === true) {
      var scroll_top_old = results_list.scrollTop();
      var scroll_top_new = scroll_top_old + elem.position().top;
      results_list.animate({scrollTop:scroll_top_new}, 'slow');
    }
  };

  var display_college_details = function(college) {
    var details = $('#college_details');
    details.scrollTop(0);
    details.empty();

    details.append(
      $('<a/>').attr({
      class: 'name',
      href: college.url,
      target: '_blank'
    }).text(college.name),

    $('<p/>').addClass('address').text(college.address)
    );

    var layout = [
      {
      title: 'Type of School',
      keys: [
        { title:'Percent Admitted', key:'percent_admitted' },
        { title:null, key:'school_types' }
      ]
    },
    {
      title: 'Size',
      keys: [
        { title:'Number of Undergraduate Students', key:'num_undergrad' },
        { title:'Number of Graduate Students', key:'num_grad' },
        { title:'Student-Faculty Ratio', key:'faculty_to_student_ratio' }
      ]
    },
    {
      title: 'Setting',
      keys: [{ title:null, key:'settings' }]
    },
    {
      title: 'Academics',
      keys: [
        { title:'Calendar', key:'calendar' },
        { title:'Degrees Offered', key:'degrees' },
        { title:null, key:'majors' }
      ]
    },
    ];

    var sect,subsect,content;
    for (var i = 0; i < layout.length; i++) {
      var has_content = false;

      var elem = layout[i];
      sect = $('<div />').addClass('sect');
      sect.append($('<span />').addClass('title').text(elem.title));

      for (var j = 0; j < elem.keys.length; j++) {
        var title = elem.keys[j].title;
        var key = elem.keys[j].key;
        var value = college[key];

        if (value === null) {
          break;
        }

        has_content = true;

        subsect = $('<div/>').addClass('subsect');
        if (title !== null) {
          subsect.append($('<span />').addClass('title').text(title+': '));
        }

        if (key === 'majors') {
          content = render_majors(value).addClass(key);
        } else if (value instanceof Array) {
          content = $('<ul/>').addClass(key);
          for (var k = 0; k < value.length; k++) {
            content.append($('<li/>').text(value[k]));
          }
        } else {
          content = $('<span/>').addClass(key).text(value);
        }

        subsect.append(content);
        sect.append(subsect);
      }

      if (has_content === true) {
        details.append(sect);
      }
    }
  };

  display_college_results = function(results, keepSelection) {
    var content = $('<ul />');

    for (var i = 0; i < results.length; i++) {
      var li = $('<li />')
      .attr({id:'college_results_'+results[i].id})
      .text(results[i].name);
      content.append(li);

      if (i === 0 && !keepSelection) {
        // show the first college by default
        highlight_college_results_list_elem(li, false);
        $.get(API_URL, {id:results[0].id}, function(response) {
          display_college_details(response);
        });
      }


      (function() {
        var cid = results[i].id;
        li.click(function() {
          selectData(MAP_COLLEGE_TO_DATA_INDEX[cid], true);
        });
      })()
    }

    $('#college_results').html(content);
  }

  $.get(
    API_URL,
    {only_id_name: 1},
    function(response) {
      display_college_results(response);
    }
  );

  $('#helpButton').click(function(){
    d3.select('#helpOverlay')
      .style('display','inline');
  });

  $('#helpOverlay').click(function(){
    d3.select('#helpOverlay')
      .style('display','none');
  });

  var gen_bitly_link = function(callback) {
    var share = $(this);
    $.get(
      "https://api-ssl.bitly.com/v3/shorten",
      {
        login:"cs448b",
        apiKey:"R_5b0758cfb5f69a16726801cc351e30e8",
        longUrl:location.href,
        format:"json"
      },
      function(response) {
        callback(response.data.url);
      }
    );
    return false;
  };

  var create_mail_to = function(bitly_url) {
    var mail_to = "mailto:?" +
      "&subject=" + escape("A uniVSity view has been shared with you!") +
      "&body=" + escape(bitly_url);
    window.location.href = mail_to;
  };

  var create_link = function(bitly_url) {
    var link = $('#link_url');
    //bitly_url = "http://google.com";
    link.attr('href', bitly_url)
    link.text(bitly_url);
    link.fadeIn();
  };

  $('#share').click(function() {
    gen_bitly_link(create_mail_to);
    return false;
  });
  $('#link').click(function() {
    var link = $('#link_url');
    link.fadeOut();

    gen_bitly_link(create_link);
    return false;
  });

  var reset_height = function(e) {
    var target = $(e.currentTarget);
    $('.token-input-list-facebook input').bind('focus.tok', fn_focus);
    $(target.parents('div')[0]).css('z-index', '10');
  };

  var fn_focus = function(e) {
    var target = $(e.currentTarget);
    var input = $('.token-input-list-facebook input');
    $(target.parents('div')[0]).css('z-index', '11');
    var list = target.parents('ul');
    list.css('max-height', 'inherit');
    input.unbind('focus.tok');
    input.unbind('blur.tok');
    target.blur();
    target.focus();
    input.bind('blur.tok', reset_height);

    $('html').bind('click.html', {list:list}, function(e) {
      var is_list = false;
      var parents = $(e.target).parents();
      for (var i = 0; i < parents.length; i += 1) {
        var parent = parents[i];
        if (parent === e.data.list[0]) {
          is_list |= true;
          break;
        }
      }
      is_list |= e.data.list[0] === e.target;

      if (is_list) {
        e.stopPropagation();
      } else {
        e.data.list.css('max-height', '24px').unbind('click.tok');
        $(this).unbind('click.html');
      }
    });
  };

  var input = $('.token-input-list-facebook input');
  input.bind('focus.tok', fn_focus);
  input.bind('blur.tok', reset_height);

/*
* 
* URL HANDLING
*
*/
  update_url = function() {
    var data = {};
    data.currentFilter = currentFilter;
    data.tok_specified_major = tok_specified_major;
    data.tok_specified_college = tok_specified_college;
    location.hash = $.param(data);
  };
  addDataChangeCallback(update_url);

  //Read URL
  read_url = function() {
    var data = $.deparam(location.hash.substr(1));

    var filter = data.currentFilter;
    for (var attr in filter) {
      if (filter.hasOwnProperty(attr)) {
        if (filter[attr]['min'] !== undefined) {
          filter[attr]['min'] = parseInt(filter[attr]['min']);
        }
        if (filter[attr]['max'] !== undefined) {
          filter[attr]['max'] = parseInt(filter[attr]['max']);
        }
        if (filter[attr]['weight'] !== undefined) {
          filter[attr]['weight'] = parseFloat(filter[attr]['weight']);
        }
      }
    }
    //TODO fill in tokenizers
    console.log(data);
    if (data.currentFilter !== undefined) {
      reloadFilter(filter);
    }

    if (data.tok_specified_college !== undefined) {
      for (var i = 0; i < data.tok_specified_college.length; i += 1) {
        tok_college.tokenInput("add", data.tok_specified_college[i]);
      }
    }
    if (data.tok_specified_major !== undefined) {
      for (var i = 0; i < data.tok_specified_major.length; i += 1) {
        tok_major.tokenInput("add", data.tok_specified_major[i]);
      }
    }
  };

  /*
  * STARS
  */
  render_stars = function() {
    var chart = $('#filterChart');
    var filter_elems = $('g.filter');

    for (var i = 2; i < filter_elems.length; i += 1) {
      (function(){
        var filter_elem = $(filter_elems[i]);
        var filter_top = filter_elem.position().top;
        var filter_id = filter_elem.attr('id');

        var star = $('<div/>')
        .attr('id', 'star_'+filter_id)
        .addClass('star')
        .addClass('star_unlit')
        .css('top', filter_top+'px');

        star.hover(function() {
          $(this).addClass('star_hover');
        }, function() {
          $(this).removeClass('star_hover');
        });

        star.click(function() {
          var target = $(this);
          target.removeClass('star_hover');
          if (target.hasClass('star_unlit')) {
            target.removeClass('star_unlit');
            target.addClass('star_lit');
            setFilterStarred(filter_id, true);
          } else {
            target.removeClass('star_lit');
            target.addClass('star_unlit');
            setFilterStarred(filter_id, false);
          }
        });

        chart.append(star);
      })();
    }
  };

  //var set_star_on = function(prop) {
  //};

  setStarState = function(prop, is_starred) {
    var star = $('#star_'+prop);
    if (is_starred) {
      star.removeClass('star_unlit');
      star.addClass('star_lit');
    } else {
      star.removeClass('star_lit');
      star.addClass('star_unlit');
    }
  };

});
