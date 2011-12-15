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
) as percent_international,

(
  select value from school_type
  join college_school_type on id = school_type_id
  where school_type_id in (4, 12, 302)
  and college_id = c.id
) as type

from college as c;

create index ci_id on college_info(id);

update college_info set percent_admitted = null
where percent_admitted = 'Not reported';
update college_info set calendar = null where calendar = 'NULL';





---

insert into college_info
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
) as percent_international,

(
  select value from school_type
  join college_school_type on id = school_type_id
  where school_type_id in (4, 12, 302)
  and college_id = c.id
) as type

from college_new as c;


update college_info set percent_admitted = null
where percent_admitted = 'Not reported';
update college_info set calendar = null where calendar = 'NULL';


---









--drop table if exists stats;
--create table stats as
select
min(student_to_faculty_ratio) as min_student_to_faculty_ratio,
max(student_to_faculty_ratio) as max_student_to_faculty_ratio,
min(num_undergrad) as min_num_undergrad,
max(num_undergrad) as max_num_undergrad,
min(num_grad) as min_num_grad,
max(num_grad) as max_num_grad,
min(percent_admitted) as min_percent_admitted,
max(percent_admitted) as max_percent_admitted,
min(population) as min_population,
max(population) as max_population,
min(percent_undergrad) as min_percent_undergrad,
max(percent_undergrad) as max_percent_undergrad,
min(percent_male) as min_percent_male,
max(percent_male) as max_percent_male,
min(percent_in_state) as min_percent_in_state,
max(percent_in_state) as max_percent_in_state,
min(percent_international) as min_percent_international,
max(percent_international) as max_percent_international
from college_info;


select
min(percent_admitted) as min_percent_admitted,
max(percent_admitted) as max_percent_admitted
from college_info;

select
min(percent_international) as min_percent_international,
max(percent_international) as max_percent_international
from college_info;


select distinct calendar from college_info;
select distinct prop_priv_pub from college_info;
select distinct size_of_city from college_info;
select distinct setting from college_info;
select distinct res_comm from college_info;










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


