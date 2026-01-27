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

-- Demo Users
INSERT INTO users (id, username, email, password, full_name, avatar_color, total_co2, total_water, total_electricity, created_date, updated_date) VALUES
(nextval('users_seq'), 'demo', 'demo@ecotrace.com', 'demo123', 'Demo User', '#10B981', 45.5, 320.0, 12.5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(nextval('users_seq'), 'john', 'john@example.com', 'pass123', 'John Doe', '#3B82F6', 38.2, 280.0, 10.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(nextval('users_seq'), 'jane', 'jane@example.com', 'pass123', 'Jane Smith', '#EC4899', 32.8, 250.0, 9.5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Bot users for global leaderboard (worldwide eco warriors)
INSERT INTO users (id, username, email, password, full_name, avatar_color, total_co2, total_water, total_electricity, created_date, updated_date, has_solar_panels, has_heat_pump) VALUES
(nextval('users_seq'), 'eco_viking', 'bot1@ecotrace.bot', 'botpass', 'Erik Nordstrom', '#10B981', 4.2, 85.0, 2.1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, false),
(nextval('users_seq'), 'green_lotus', 'bot2@ecotrace.bot', 'botpass', 'Yuki Tanaka', '#6366F1', 5.8, 92.0, 2.8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, true),
(nextval('users_seq'), 'sustainable_sam', 'bot3@ecotrace.bot', 'botpass', 'Sam Wilson', '#F59E0B', 7.3, 110.0, 3.5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, false),
(nextval('users_seq'), 'earth_guardian', 'bot4@ecotrace.bot', 'botpass', 'Maria Santos', '#EC4899', 6.1, 98.0, 2.9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, true),
(nextval('users_seq'), 'climate_hero', 'bot5@ecotrace.bot', 'botpass', 'Alex Chen', '#8B5CF6', 8.5, 125.0, 4.2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, false),
(nextval('users_seq'), 'eco_warrior', 'bot6@ecotrace.bot', 'botpass', 'Lena Mueller', '#14B8A6', 5.2, 88.0, 2.4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, false),
(nextval('users_seq'), 'planet_saver', 'bot7@ecotrace.bot', 'botpass', 'Marco Rossi', '#F43F5E', 9.8, 145.0, 5.1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, false),
(nextval('users_seq'), 'green_ninja', 'bot8@ecotrace.bot', 'botpass', 'Aiko Yamamoto', '#22C55E', 4.8, 82.0, 2.2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, true),
(nextval('users_seq'), 'eco_pioneer', 'bot9@ecotrace.bot', 'botpass', 'Emma Johnson', '#3B82F6', 6.7, 105.0, 3.1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, true),
(nextval('users_seq'), 'nature_friend', 'bot10@ecotrace.bot', 'botpass', 'Pierre Dubois', '#EAB308', 7.9, 118.0, 3.8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, false),
(nextval('users_seq'), 'carbon_cutter', 'bot11@ecotrace.bot', 'botpass', 'Sofia Andersson', '#06B6D4', 5.5, 90.0, 2.6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, false),
(nextval('users_seq'), 'eco_champion', 'bot12@ecotrace.bot', 'botpass', 'Lucas Schmidt', '#A855F7', 8.2, 130.0, 4.5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, true);
