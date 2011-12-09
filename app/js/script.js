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

  var display_college_details = function(college) {
    console.log(college);
    var sect;
    var details = $('#college_details');
    details.empty();

    details.append(
      $('<a/>').attr({
      class: 'name',
      href: college.url,
      target: '_blank'
    }).text(college.name),

    $('<p/>').text(college.address)
    );

    sect = $('<div />').addClass('sect');
    sect.append($('<span />').addClass('sect_title').text('Main Address'));
    sect.append($('<p/>').text());
    details.append(sect);
  };

  var display_college_results = function(results) {
    console.log(results);
    var content = $('<ul />');
    for (var i = 0; i < results.length; i++) {
      var li = $('<li />').text(results[i].name);
      content.append(li);

      (function() {
        var cid = results[i].id;
        li.hover(function() {
          console.log(cid);
          $.get(API_URL, {id: cid}, display_college_details);
        });
      })()
    }
    $('#college_results').html(content);
  }

  $.get(API_URL, {only_id_name: 1}, display_college_results);

});
