-- Predefined Activities
INSERT INTO activities (id, name, category, co2_per_unit, water_per_unit, electricity_per_unit, unit, icon, description) VALUES
(nextval('activities_seq'), 'Shower', 'home', 0,5, 50,0, 1,5, 'minutes', '🚿', 'Taking a shower'),
(nextval('activities_seq'), 'Bath', 'home', 0,8, 150,0, 2,5, 'times', '🛁', 'Taking a bath'),
(nextval('activities_seq'), 'Dishwasher', 'home', 0,8, 15,0, 1,5, 'times', '🍽️', 'Running dishwasher'),
(nextval('activities_seq'), 'Washing Machine', 'home', 0,6, 50,0, 0,9, 'times', '👕', 'Doing laundry'),
(nextval('activities_seq'), 'Heating', 'home', 5,0, 0,0, 10,0, 'hours', '🔥', 'Using central heating'),
(nextval('activities_seq'), 'Air Conditioning', 'home', 4,0, 0,0, 8,0, 'hours', '❄️', 'Using air conditioning'),
(nextval('activities_seq'), 'Computer Usage', 'home', 0,3, 0,0, 0,5, 'hours', '💻', 'Using desktop computer'),
(nextval('activities_seq'), 'TV Watching', 'home', 0,2, 0,0, 0,2, 'hours', '📺', 'Watching television'),
(nextval('activities_seq'), 'Meal', 'food', 8,0, 3000,0, 0,0, 'times', '🍽️', 'Eating a standard mixed meal'),
(nextval('activities_seq'), 'New Clothes', 'shopping', 6,0, 2700,0, 0,0, 'items', '👔', 'Buying new clothing'),
(nextval('activities_seq'), 'New Electronics', 'shopping', 50,0, 1000,0, 0,0, 'items', '📱', 'Buying new electronics'),
(nextval('activities_seq'), 'Online Shopping', 'shopping', 1,5, 0,0, 0,0, 'items', '📦', 'Online package delivery'),
(nextval('activities_seq'), 'Grocery Shopping', 'shopping', 0,5, 50,0, 0,0, 'times', '🛒', 'Shopping for groceries'),
(nextval('activities_seq'), 'Waste', 'other', 0,9, 15,0, 0,0, 'kg', '🗑️', 'General waste produced'),
(nextval('activities_seq'), 'Recycling / Composting', 'other', -0,4, 0,0, 0,0, 'kg', '♻️', 'Environmentally friendly disposal'),
(nextval('activities_seq'), 'Cycling', 'transport', 0,0, 0,0, 0,0, 'km', '🚴', 'Riding a bicycle'),
(nextval('activities_seq'), 'Walking', 'transport', 0,0, 0,0, 0,0, 'km', '🚶', 'Walking on foot'),
(nextval('activities_seq'), 'Uber Car Trip', 'transport', 0,2, 0,0, 0,0, 'km', '🚖', 'Using an Uber to drive you from A to B'),
(nextval('activities_seq'), 'E-Scooter Ride', 'transport', 0,0, 0,0, 0,0, 'km', '🛴', 'Riding an electric scooter'),
(nextval('activities_seq'), 'Oven Use', 'home', 1,6, 0,0, 1,5, 'hours', '🍞', 'Using an electric oven'),
(nextval('activities_seq'), 'Stove Cooking', 'home', 0,6, 0,0, 0,8, 'hours', '🍳', 'Cooking on an electric stove'),
(nextval('activities_seq'), 'Microwave Use', 'home', 0,1, 0,0, 0,2, 'times', '📡', 'Heating food in a microwave'),
(nextval('activities_seq'), 'Hair Dryer Use', 'home', 0,1, 0,0, 0,2, 'times', '💨', 'Drying hair with an electric hair dryer'),
(nextval('activities_seq'), 'Ironing Clothes', 'home', 0,1, 0,0, 0,3, 'hours', '🧺', 'Ironing clothes with an electric iron'),
(nextval('activities_seq'), 'Air Fryer Use', 'home', 0,3, 0,0, 0,5, 'times', '🍟', 'Cooking food in an air fryer'),
(nextval('activities_seq'), 'Kettle Boil', 'home', 0,0, 0,0, 0,1, 'times', '☕', 'Boiling water in an electric kettle'),
(nextval('activities_seq'), 'Dehumidifier Use', 'home', 0,1, 0,0, 0,2, 'hours', '💦', 'Running a room dehumidifier'),
(nextval('activities_seq'), 'Streaming Video', 'home', 0,1, 0,0, 0,2, 'hours', '📹', 'Streaming video online'),
(nextval('activities_seq'), 'Music Speaker', 'home', 0,0, 0,0, 0,1, 'hours', '🔊', 'Listening to music on speakers'),
(nextval('activities_seq'), 'Restaurant Meal', 'food', 10,0, 5000,0, 0,0, 'times', '🍴', 'Eating a restaurant meal'),
(nextval('activities_seq'), 'Fast Food Meal', 'food', 7,0, 3500,0, 0,0, 'times', '🍔', 'Eating a fast food meal'),
(nextval('activities_seq'), 'Takeaway Delivery', 'food', 4,0, 2000,0, 0,0, 'times', '📦', 'Ordering food delivery'),
(nextval('activities_seq'), 'Car Drive', 'transport', 192,0, 0,0, 0,0, 'km', '🚗', 'Driving a gasoline car'),
(nextval('activities_seq'), 'Electric Car', 'transport', 53,0, 0,0, 0,3, 'km', '⚡', 'Driving an electric vehicle'),
(nextval('activities_seq'), 'Bus Ride', 'transport', 89,0, 0,0, 0,0, 'km', '🚌', 'Taking public bus transportation'),
(nextval('activities_seq'), 'Train Journey', 'transport', 41,0, 0,0, 0,0, 'km', '🚆', 'Traveling by train'),
(nextval('activities_seq'), 'Flight', 'transport', 255,0, 0,0, 0,0, 'km', '✈️', 'Air travel'),
(nextval('activities_seq'), 'E-Bike Ride', 'transport', 15,0, 0,0, 0,0, 'km', '🚲', 'Riding an electric bicycle'),
(nextval('activities_seq'), 'Test', 'test', 1,0, 1000,0, 0,0, 'times', 'f', 'danffnsdnfjd'),
(nextval('activities_seq'), 'fsfsdf', 'sdfsdfsd', 0,0, 0,0, 0,0, 'sdfsddsf', 'f', 'sdfsd'),
(nextval('activities_seq'), 'test1', 'sdfsdfsd', 0,0, 0,0, 0,0, 'sdfsddsf', 'f', 'sdfsd');

-- Demo Users
INSERT INTO users (id, username, email, password, full_name, avatar_color, total_co2, total_water, total_electricity, created_date, updated_date) VALUES
(nextval('users_seq'), 'demo', 'demo@ecotrace.com', 'demo123', 'Demo User', '#10B981', 245.5, 15000.0, 125.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(nextval('users_seq'), 'john', 'john@example.com', 'password123', 'John Doe', '#3B82F6', 180.0, 12000.0, 90.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(nextval('users_seq'), 'jane', 'jane@example.com', 'password123', 'Jane Smith', '#EC4899', 320.5, 18000.0, 150.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Achievements
INSERT INTO achievements (id, name, description, icon, category, target_value, target_type, specific_activity, badge_color, points) VALUES
(nextval('achievements_seq'), 'First Steps', 'Log your first environmental activity', '🌱', 'MILESTONE', 1, 'ACTIVITY_COUNT', null, '#10B981', 10),
(nextval('achievements_seq'), 'Getting Started', 'Log 5 environmental activities', '🌿', 'MILESTONE', 5, 'ACTIVITY_COUNT', null, '#10B981', 20),
(nextval('achievements_seq'), 'Habit Former', 'Log 10 environmental activities', '🌳', 'MILESTONE', 10, 'ACTIVITY_COUNT', null, '#10B981', 30),
(nextval('achievements_seq'), 'Eco Warrior', 'Log 25 environmental activities', '🏆', 'MILESTONE', 25, 'ACTIVITY_COUNT', null, '#F59E0B', 50),
(nextval('achievements_seq'), 'Environmental Champion', 'Log 50 environmental activities', '👑', 'MILESTONE', 50, 'ACTIVITY_COUNT', null, '#EF4444', 100),

(nextval('achievements_seq'), 'Pedal Power', 'Cycle 10 times', '🚴', 'ACTIVITY', 10, 'SPECIFIC_ACTIVITY', 'Cycling', '#3B82F6', 25),
(nextval('achievements_seq'), 'Walker', 'Walk 10 times', '🚶', 'ACTIVITY', 10, 'SPECIFIC_ACTIVITY', 'Walking', '#8B5CF6', 25),
(nextval('achievements_seq'), 'Green Commuter', 'Use public transport 15 times', '🚌', 'ACTIVITY', 15, 'SPECIFIC_ACTIVITY', 'Bus Ride', '#06B6D4', 30),
(nextval('achievements_seq'), 'Recycling Hero', 'Recycle or compost 20 times', '♻️', 'ACTIVITY', 20, 'SPECIFIC_ACTIVITY', 'Recycling / Composting', '#10B981', 35),

(nextval('achievements_seq'), 'Week Warrior', 'Log activities for 7 consecutive days', '📅', 'STREAK', 7, 'DAYS_STREAK', null, '#8B5CF6', 40),
(nextval('achievements_seq'), 'Consistency King', 'Log activities for 14 consecutive days', '📆', 'STREAK', 14, 'DAYS_STREAK', null, '#8B5CF6', 60),
(nextval('achievements_seq'), 'Dedication Master', 'Log activities for 30 consecutive days', '🔥', 'STREAK', 30, 'DAYS_STREAK', null, '#EF4444', 100),

(nextval('achievements_seq'), 'Social Butterfly', 'Add 3 friends', '👥', 'SOCIAL', 3, 'FRIENDS_COUNT', null, '#EC4899', 25),
(nextval('achievements_seq'), 'Community Builder', 'Add 5 friends', '👫', 'SOCIAL', 5, 'FRIENDS_COUNT', null, '#EC4899', 40),
(nextval('achievements_seq'), 'Network Effect', 'Add 10 friends', '🌐', 'SOCIAL', 10, 'FRIENDS_COUNT', null, '#EC4899', 60),

(nextval('achievements_seq'), 'Low Carbon Hero', 'Keep total CO2 under 100kg', '🌍', 'CO2_REDUCTION', 100, 'LOW_CO2', null, '#10B981', 50),
(nextval('achievements_seq'), 'Carbon Neutral', 'Keep total CO2 under 50kg', '🌏', 'CO2_REDUCTION', 50, 'LOW_CO2', null, '#10B981', 75),
(nextval('achievements_seq'), 'Planet Saver', 'Keep total CO2 under 25kg', '🌎', 'CO2_REDUCTION', 25, 'LOW_CO2', null, '#10B981', 100);

-- Demo User Achievements (Demo User = ID 1, Achievements start at ID 1)
INSERT INTO user_achievements (id, user_id, achievement_id, progress, unlocked_at, is_new) VALUES
(nextval('user_achievements_seq'), 1, 1, 100, CURRENT_TIMESTAMP, false),  -- First Steps
(nextval('user_achievements_seq'), 1, 2, 100, CURRENT_TIMESTAMP, false),  -- Getting Started
(nextval('user_achievements_seq'), 1, 3, 80, null, false),                -- Habit Former (in progress)
(nextval('user_achievements_seq'), 1, 13, 100, CURRENT_TIMESTAMP, true),  -- Social Butterfly (new!)
(nextval('user_achievements_seq'), 1, 6, 100, CURRENT_TIMESTAMP, false);  -- Pedal Power
