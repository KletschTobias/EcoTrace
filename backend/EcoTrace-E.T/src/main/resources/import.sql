-- Predefined Activities
INSERT INTO activities (id, name, category, co2_per_unit, water_per_unit, electricity_per_unit, unit, icon, description) VALUES 
(nextval('activities_seq'), 'Car Drive', 'transport', 0.192, 0.0, 0.0, 'km', '🚗', 'Driving a gasoline car'),
(nextval('activities_seq'), 'Electric Car', 'transport', 0.053, 0.0, 0.3, 'km', '⚡', 'Driving an electric vehicle'),
(nextval('activities_seq'), 'Bus Ride', 'transport', 0.089, 0.0, 0.0, 'km', '🚌', 'Taking public bus transportation'),
(nextval('activities_seq'), 'Train Journey', 'transport', 0.041, 0.0, 0.0, 'km', '🚆', 'Traveling by train'),
(nextval('activities_seq'), 'Flight', 'transport', 0.255, 0.0, 0.0, 'km', '✈️', 'Air travel'),
(nextval('activities_seq'), 'Cycling', 'transport', 0.0, 0.0, 0.0, 'km', '🚴', 'Riding a bicycle'),
(nextval('activities_seq'), 'Walking', 'transport', 0.0, 0.0, 0.0, 'km', '🚶', 'Walking'),

(nextval('activities_seq'), 'Shower', 'home', 0.5, 50.0, 1.5, 'minutes', '🚿', 'Taking a shower'),
(nextval('activities_seq'), 'Bath', 'home', 0.8, 150.0, 2.5, 'times', '🛁', 'Taking a bath'),
(nextval('activities_seq'), 'Dishwasher', 'home', 0.8, 15.0, 1.5, 'times', '🍽️', 'Running dishwasher'),
(nextval('activities_seq'), 'Washing Machine', 'home', 0.6, 50.0, 0.9, 'times', '👕', 'Doing laundry'),
(nextval('activities_seq'), 'Heating', 'home', 5.0, 0.0, 10.0, 'hours', '🔥', 'Using central heating'),
(nextval('activities_seq'), 'Air Conditioning', 'home', 4.0, 0.0, 8.0, 'hours', '❄️', 'Using air conditioning'),
(nextval('activities_seq'), 'Computer Usage', 'home', 0.3, 0.0, 0.5, 'hours', '💻', 'Using desktop computer'),
(nextval('activities_seq'), 'TV Watching', 'home', 0.2, 0.0, 0.15, 'hours', '📺', 'Watching television'),

(nextval('activities_seq'), 'Beef Meal', 'food', 27.0, 15415.0, 0.0, 'times', '🥩', 'Eating beef'),
(nextval('activities_seq'), 'Chicken Meal', 'food', 6.9, 4325.0, 0.0, 'times', '🍗', 'Eating chicken'),
(nextval('activities_seq'), 'Fish Meal', 'food', 6.1, 3918.0, 0.0, 'times', '🐟', 'Eating fish'),
(nextval('activities_seq'), 'Vegetarian Meal', 'food', 2.0, 322.0, 0.0, 'times', '🥗', 'Eating vegetarian food'),
(nextval('activities_seq'), 'Vegan Meal', 'food', 1.5, 287.0, 0.0, 'times', '🌱', 'Eating vegan food'),
(nextval('activities_seq'), 'Coffee', 'food', 0.1, 140.0, 0.0, 'times', '☕', 'Drinking coffee'),
(nextval('activities_seq'), 'Tea', 'food', 0.02, 27.0, 0.0, 'times', '🍵', 'Drinking tea'),

(nextval('activities_seq'), 'New Clothes', 'shopping', 6.0, 2700.0, 0.0, 'items', '👔', 'Buying new clothing'),
(nextval('activities_seq'), 'New Electronics', 'shopping', 50.0, 1000.0, 0.0, 'items', '📱', 'Buying new electronics'),
(nextval('activities_seq'), 'Online Shopping', 'shopping', 1.5, 0.0, 0.0, 'items', '📦', 'Online package delivery'),
(nextval('activities_seq'), 'Grocery Shopping', 'shopping', 0.5, 50.0, 0.0, 'times', '🛒', 'Shopping for groceries'),

(nextval('activities_seq'), 'Plastic Bottle', 'other', 0.08, 0.0, 0.0, 'items', '🧴', 'Using plastic bottle'),
(nextval('activities_seq'), 'Paper Usage', 'other', 0.004, 10.0, 0.0, 'sheets', '📄', 'Using paper'),
(nextval('activities_seq'), 'Recycling', 'other', -0.5, 0.0, 0.0, 'kg', '♻️', 'Recycling waste'),
(nextval('activities_seq'), 'Composting', 'other', -0.3, 0.0, 0.0, 'kg', '🌿', 'Composting organic waste');

-- NOTE: Users are automatically created via Keycloak OIDC flow and KeycloakUserFilter
-- when a user logs in for the first time. No need to insert demo users here.
