-- TODO make sure all preset data exists
-- TODO add foreign key references
-- TODO majors - get data

pragma foreign_keys = on;

create table college (
  id integer primary key autoincrement,
  name text,
  url text,
  address text,
  faculty_to_student_ratio text,
  num_grad integer,
  num_undergrad integer,
  percent_admitted integer,
  calendar text
);

create table degree (
  id integer primary key autoincrement,
  value text
);

create table demographics_first_year (
  id integer primary key autoincrement,
  value text
);

create table school_type (
  id integer primary key autoincrement,
  value text
);

create table setting (
  id integer primary key autoincrement,
  value text
);

create table major (
  id integer primary key autoincrement,
  degree_type text,
  category text,
  name text
);


/* ----- INDEXES ----- */

create index college_name on college(name);
create index college_address on college(address);
create index major_name on major(name);

/* ----- END INDEXES ----- */



/* ----- JOIN TABLES ----- */

create table college_degree (
  college_id integer
    references college(id)
    on update cascade
    on delete cascade,
  degree_id integer
    references degree(id)
    on update cascade
    on delete cascade,
  primary key(college_id, degree_id)
);

create table college_demographics_first_year (
  college_id integer
    references college(id)
    on update cascade
    on delete cascade,
  demographics_first_year_id integer
    references demographics_first_year(id)
    on update cascade
    on delete cascade,
  percentage integer,
  primary key(college_id, demographics_first_year_id)
);

create table college_school_type (
  college_id integer
    references college(id)
    on update cascade
    on delete cascade,
  school_type_id integer
    references school_type(id)
    on update cascade
    on delete cascade,
  primary key(college_id, school_type_id)
);

create table college_setting (
  college_id integer
    references college(id)
    on update cascade
    on delete cascade,
  setting_id integer
    references setting(id)
    on update cascade
    on delete cascade,
  primary key(college_id, setting_id)
);

create table college_major (
  college_id integer
    references college(id)
    on update cascade
    on delete cascade,
  major_id integer
    references major(id)
    on update cascade
    on delete cascade,
  primary key(college_id, major_id)
);

/* ----- END JOIN TABLES ----- */




/* ----- PRESET DATA ----- */

-- TODO any others?

insert into degree(value) values("Bachelor's");
insert into degree(value) values("Master's");
insert into degree(value) values("Doctoral");

insert into demographics_first_year(value) values("In-state students");
insert into demographics_first_year(value) values("Out-of-state students");
insert into demographics_first_year(value) values("Women");
insert into demographics_first_year(value) values("Men");
insert into demographics_first_year(value) values("American Indian or Alaska Native");
insert into demographics_first_year(value) values("Asian");
insert into demographics_first_year(value) values("Black or African American");
insert into demographics_first_year(value) values("Hispanic/Latino");
insert into demographics_first_year(value) values("White");
insert into demographics_first_year(value) values("Two or more races");
insert into demographics_first_year(value) values("Non-Resident Alien");
insert into demographics_first_year(value) values("in top 10th of graduating class");
insert into demographics_first_year(value) values("in top quarter of graduating class");
insert into demographics_first_year(value) values("in top half of graduating class");
insert into demographics_first_year(value) values("had h.s. GPA of 3.75 and higher");
insert into demographics_first_year(value) values("had h.s. GPA between 3.5 and 3.74");
insert into demographics_first_year(value) values("had h.s. GPA between 3.25 and 3.49");
insert into demographics_first_year(value) values("had h.s. GPA between 3.0 and 3.24");

insert into school_type(value) values("Private");
insert into school_type(value) values("Liberal Arts College");
insert into school_type(value) values("University");
insert into school_type(value) values("Four-year");
insert into school_type(value) values("Coed");
insert into school_type(value) values("Regionally Accredited");
insert into school_type(value) values("Western Association of Schools and Colleges");
insert into school_type(value) values("College Board member");

insert into setting(value) values("Suburban setting");
insert into setting(value) values("Small city (50000 - 249999)");
insert into setting(value) values("Residential campus");

/* ----- END PRESET DATA ----- */
