alter table college add column latitude float default null;
alter table college add column longitude float default null;
alter table college add column gmap_lat_long_address text;
alter table college add column is_usa integer default 0;
