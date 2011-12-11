$(document).ready(function() {

  var API_URL = '../api/college.php';
  var COLLEGE_RESULTS_LIMIT = 5000;
  var COLLEGE_RESULTS_OFFSET = 0;
  var MAIL_TO = "mailto:?"
    + "&subject=" + escape("A uniVSity view has been shared with you!")
    + "&body=" + escape(location.href);
  console.log(MAIL_TO);

  $("#tok_college").tokenInput(
    '../api/college_name.php',
    {
      minChars: 2,
      preventDuplicates: true,
      prePopulate: [],
      animateDropdown: false,
      hintText: "Type in a college name",
      theme: "facebook"
    }
  );

  var t = $("#tok_major").tokenInput(
    '../api/major.php',
    {
      minChars: 2,
      preventDuplicates: true,
      prePopulate: [],
      animateDropdown: false,
      hintText: "Type in a major",
      theme: "facebook"
    }
  );
  console.log(t.attr('id'));


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


  var display_college_details = function(college, offset_top) {
    var details = $('#college_details');
    //var offset_left = details.offset().left;
    //details.offset({ left: offset_left, top: offset_top });
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

  var display_college_results = function(results, is_append) {
    var content = $('<ul />');
    var active = null;

    for (var i = 0; i < results.length; i++) {
      var li = $('<li />').text(results[i].name);
      content.append(li);

      if (i === 0) {
        // show the first by default
        active = li;
        active.addClass('active');
        $.get(API_URL, {id: results[0].id}, function(response) {
          display_college_details(response, active.offset().top);
        });
      }


      (function() {
        var cid = results[i].id;
        li.click(function() {
          active.removeClass('active');
          active = $(this);
          active.addClass('active');
          $.get(API_URL, {id: cid}, function(response) {
            display_college_details(response, active.offset().top);
          });
        });
      })()
    }

    var li_more = $('<li/>')
    .addClass('more')
    .text('View More Results')
    .click(function(){
      COLLEGE_RESULTS_OFFSET += 1;
      $.get(
        API_URL,
        {only_id_name: 1},
        function(response) {
          display_college_results(response, true);
        });
    });
    content.append(li_more);

    if (is_append === true) {
      $('#college_results').append(content);
    } else {
      $('#college_results').html(content);
    }
  }

  $.get(
    API_URL,
    {limit: COLLEGE_RESULTS_LIMIT, offset: COLLEGE_RESULTS_OFFSET, only_id_name: 1},
    function(response) {
      display_college_results(response, false);
    });

  $('#share').attr('href', MAIL_TO)

  console.log(location.hash);
  location.hash = 'foo';
  console.log(location.hash);


  var reset_height = function(e) {
    $(e.currentTarget).parents('ul').css('max-height', '24px');
    var target = $(e.currentTarget);
  $('.token-input-list-facebook input').bind('focus.tok', fn_focus);
  };
  var fn_focus = function(e) {
    var target = $(e.currentTarget);
    target.parents('ul').css('max-height', 'inherit');
    $('.token-input-list-facebook input').unbind('focus.tok');
    $('.token-input-list-facebook input').unbind('blur.tok');
    target.blur();
    target.focus();
    $('.token-input-list-facebook input').bind('blur.tok', reset_height);
  };

  $('.token-input-list-facebook input').bind('focus.tok', fn_focus);
  $('.token-input-list-facebook input').bind('blur.tok', reset_height);

});
