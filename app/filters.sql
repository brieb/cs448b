drop table college_info;
create table college_info as
select
id,
name,
url,
address,
cast(replace(faculty_to_student_ratio, ':1', '') as float) as student_to_faculty_ratio,
num_undergrad,
num_grad,
percent_admitted,
calendar,
latitude,
longitude,
num_undergrad+num_grad as population,
cast(round(cast(num_undergrad as real)/(num_undergrad+num_grad)*100) as integer) as percent_undergrad,

(
  select percentage from
  college_demographics_first_year
  where
  college_demographics_first_year.demographics_first_year_id = 4
  and college_id = c.id
) as percent_male,

(
  select percentage from
  college_demographics_first_year
  where
  college_demographics_first_year.demographics_first_year_id = 1
  and college_id = c.id
) as percent_in_state,

(
  select
  value
  from
  school_type
  join college_school_type
  on id = school_type_id
  where id in (1,9,66)
  and college_id = c.id
) as prop_priv_pub,

(
  select
  value
  from
  setting
  join college_setting
  on id = setting_id
  where id in (178,4,13,7,57,28)
  and college_id = c.id
) as size_of_city,

(
  select
  value
  from
  setting
  join college_setting
  on id = setting_id
  where id in (1,3,9)
  and college_id = c.id
) as setting,

(
  select
  value
  from
  setting
  join college_setting
  on id = setting_id
  where id in (2,11)
  and college_id = c.id
) as res_comm,

(
  select percentage from
  college_demographics_first_year
  where
  college_demographics_first_year.demographics_first_year_id = 11
  and college_id = c.id
) as percent_international

from college as c;

create index ci_id on college_info(id);









join college_demographics_first_year as cdfy
on cdfy.college_id = c.id
join demographics_first_year as dfy
on dfy.id = cdfy.demographics_first_year_id
where
value = "Men"



select percentage from
demographics_first_year
join college_demographics_first_year
on demographics_first_year.id =
college_demographics_first_year.demographics_first_year_id
join college
on college_demographics_first_year.college_id = 
college.id
where
value = "Men"

(
  select value from degree
  where id in (
    select degree_id from college_degree
    where college_id = c.id)
) as degrees



select id,value from school_type order by value asc;


select
id
from
college
where
id not in (
  select
  distinct college_id from college_school_type
  where
  school_type_id in (4, 12, 302)
);


select id from college
except
select college_id from college_school_type where school_type_id in (1,9,66)
;


178|Rural community (under 2,500)
4|Small town (2,500 - 9,999)
13|Large town (10,000 - 49,999)
7|Small city (50,000 - 249,999)
57|Large city (250,000 - 499,999)
28|Very large city (over 500,000)



1|Suburban setting
2|Residential campus
3|Rural setting
9|Urban setting
11|Commuter campus

select id,value from setting where id not in (178,4,13,7,57,28);

1|Suburban setting
3|Rural setting
9|Urban setting

11|Commuter campus
2|Residential campus

select cast(replace(student_to_faculty_ratio, ':1', '') as float)
from college_info where student_to_faculty_ratio notnull;


