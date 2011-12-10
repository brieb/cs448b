$(document).ready(function() {

  var API_URL = '../api/college.php';

  $("#tok_college").tokenInput(
    [{"id":"856","name":"College"}],
    {
      minChars: 2,
      preventDuplicates: true,
      prePopulate: [],
      animateDropdown: false,
      hintText: "Type in a college name",
      theme: "facebook"
    }
  );

  $("#tok_major").tokenInput(
    [],
    {
      minChars: 2,
      preventDuplicates: true,
      prePopulate: [],
      animateDropdown: false,
      hintText: "Type in a major",
      theme: "facebook"
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


  var display_college_details = function(college) {
    console.log(college);
    var details = $('#college_details');
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
      keys: ['percent_admitted', 'school_types']
    },
    {
      title: 'Size',
      keys: ['num_undergrad', 'num_grad', 'faculty_to_student_ratio']
    },
    {
      title: 'Setting',
      keys: ['settings']
    },
    {
      title: 'Academics',
      keys: ['calendar', 'degrees', 'majors']
    },
    ];

    var sect;
    for (var i = 0; i < layout.length; i++) {
      var elem = layout[i];
      sect = $('<div />').addClass('sect');
      sect.append($('<span />').addClass('title').text(elem.title));
      for (var j = 0; j < elem.keys.length; j++) {
        var key = elem.keys[j];
        var value = college[key];
        var content;
        if (key === 'majors') {
          content = render_majors(value).addClass(key);
        } else if (value instanceof Array) {
          content = $('<ul/>').addClass(key);
          for (var k = 0; k < value.length; k++) {
            content.append($('<li/>').text(value[k]));
          }
        } else {
          content = $('<p/>').addClass(key).text(value);
        }
        sect.append(content);
      }
      details.append(sect);
    }
  };

  var display_college_results = function(results) {
    var content = $('<ul />');
    var active = null;

    for (var i = 0; i < results.length; i++) {
      var li = $('<li />').text(results[i].name);
      content.append(li);

      (function() {
        var cid = results[i].id;
        li.click(function() {
          if (active !== null) {
            active.removeClass('active');
          }
          active = $(this);
          active.addClass('active');
          $.get(API_URL, {id: cid}, display_college_details);
        });
      })()
    }
    $('#college_results').html(content);
  }

  $.get(API_URL, {only_id_name: 1}, display_college_results);

});
